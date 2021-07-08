let nowInterval
let pauseInterval = false
let nowScrollTimeout
let nowPolling = false

async function idToMember(id) {
    const token = localStorage.getItem("token")
    const memberListRaw = localStorage.getItem("memberList")

    if(memberListRaw) {
        const memberList = JSON.parse(memberListRaw)
        const member = memberList.list.find(o => o.id === id)
        if(member) {
            return member
        }
    }

    //get member list
    const resMemberList = await axios({
        method: "get",
        url: "https://api.chat.aquaco.work/member",
        headers: {
            Authorization: token
        }
    })
    
    localStorage.setItem("memberList", JSON.stringify({ list: resMemberList.data.list }))

    const memberList = resMemberList.data
    const member = memberList.list.find(o => o.id === id)
    if(member) {
        return member
    }

    throw new Error("프로필 못 찾음")
}

async function read(token, list, isPrev = false) {
    const myId = JSON.parse(atob(token.split(".")[1])).id
    
    let section = document.querySelector("section")
    for(const item of list) {
        const article = document.createElement("article")
        article.dataset.conmmentNo = item.id

        if(item.chatter !== myId) {
            article.classList.add("other")

            const profile = document.createElement("div")
            profile.classList.add("profile")

            const image = document.createElement("div")
            image.classList.add("image")
            //채팅방이 시작하면 member list를 받아와서 그 리스트에서 부른다.

            const img = document.createElement("img")
            img.src = (await idToMember(item.chatter)).profile_link

            image.append(img)
            profile.append(image)

            const body = document.createElement("div")
            body.classList.add("body")

            const nickname = document.createElement("div")
            nickname.classList.add("nickname")
            nickname.innerText = (await idToMember(item.chatter)).nickname

            const comment = document.createElement("div")
            comment.classList.add("comment")
            comment.innerText = item.text

            body.append(nickname, comment)

            const time = document.createElement("div")
            time.classList.add("time")
            time.innerText = moment.utc(item.datetime).tz('Asia/Seoul').format('HH:mm')

            article.append(profile, body, time)
        } else {
            article.classList.add("me")
            
            const time = document.createElement("div")
            time.classList.add("time")
            time.innerText = item.datetime ? moment.utc(item.datetime).tz('Asia/Seoul').format('HH:mm') : ''

            const body = document.createElement("div")
            body.classList.add("body")

            const comment = document.createElement("div")
            comment.classList.add("comment")
            comment.innerText = item.text

            body.append(comment)
            article.append(time, body)
        }
        if(isPrev) {
            section.prepend(article)
        } else {
            section.append(article)
        }

    }
}

async function readComment() {
    try {
        // console.log(nowPolling)
        if(nowPolling) return

        nowPolling = true

        const token = localStorage.getItem("token")
        const article = document.querySelector("main > section > article:last-child")
        const lastChatId = article.dataset.conmmentNo

        const res = await axios({
            method: "get",
            url: `https://api.chat.aquaco.work?lastChatId=${lastChatId}`,
            headers: {
                Authorization: token
            }
        })

        const section = document.querySelector("section")
        const flagIsScrollBottom = section.scrollHeight - section.offsetHeight - 10 <= section.scrollTop

        const list = res.data.list
        if(res.data.success) {
            if(res.data.list.length) {
                document.querySelectorAll(`article[data-conmment-no="-1"]`).forEach((v) => {
                    v.remove()
                })
                await read(token, list)
                if(flagIsScrollBottom) {
                    section.scrollTop = section.scrollHeight - section.offsetHeight
                }
            }
        } else {
            throw new Error()
        }
        
        nowPolling = false
    } catch(e) {
        const err = e.message || e.toString()
        nowPolling = false
    }
}

async function writeComment() {
    try {
        const token = localStorage.getItem("token")
        const comment = document.querySelector("footer > div.text > input").value
    
        document.querySelector("footer > div.text > input").value = ""

        const res = await axios({
            method: "post",
            url: `https://api.chat.aquaco.work`,
            headers: {
                Authorization: token
            },
            data: {
                comment
            }
        })

        if(res.data) {
            // polling()
            const myId = JSON.parse(atob(token.split(".")[1])).id
            const list = [{ 
                id: -1,
                chatter: myId,
                text: comment
            }]
            await read(token, list)

            const section = document.querySelector("section")
            section.scrollTop = section.scrollHeight - section.offsetHeight
        } else {
            throw new Error()
        }
    } catch(e) {
        const err = e.message || e.toString()
    }
}

async function polling() {
    try {
        if(!pauseInterval) {
            if(!nowInterval) {
                nowInterval = true
                await readComment()
                nowInterval = false
            }
        }
    } catch(e) {
        nowInterval = false
        const err = e.message || e.toString()
    }
}

function scrollHander(section) {
    if(nowScrollTimeout) {
        clearTimeout(nowScrollTimeout)
    }
    nowScrollTimeout = setTimeout(() => {
        if(section.scrollTop === 0) {
            readPrev()
        }
    }, 100)
}

async function readPrev() {
    try {
        pauseInterval = true
        const section = document.querySelector("section")
        const scrollHeightAtStart = section.scrollHeight
        
        const token = localStorage.getItem("token")
        const article = document.querySelector("main > section > article:first-child")
        const firstChatId = article.dataset.conmmentNo
    
        const res = await axios({
            method: "get",
            url: `https://api.chat.aquaco.work?lastChatId=${firstChatId}&prev=true`,
            headers: {
                Authorization: token
            }
        })
        
        const list = res.data.list
        
        if(res.data.success) {
            await read(token, list, true)
            section.scrollTop = section.scrollHeight - scrollHeightAtStart
            pauseInterval = false
        } else {
            throw new Error()
        }
    } catch(e) {
        pauseInterval = false
    }
}

;(async () => {
    try {
        const token = localStorage.getItem("token")
        
        //read last 100 chat when login
        const res = await axios({
            method: "get",
            url: `https://api.chat.aquaco.work/`,
            headers: {
                Authorization: token
            }
        })

        const section = document.querySelector("section")
        section.innerHTML = ""

        const list = res.data.list.reverse()
        await read(token, list)
        section.scrollTop = section.scrollHeight - section.offsetHeight

        //polling
        // setInterval(polling, 1000)

        //long polling
        setInterval(readComment, 500)

    } catch(e) {
        console.error(e)
        const err = e.message || e.toString()
        location.href = "/login.html"
    }
})()