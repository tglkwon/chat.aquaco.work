import { utcToZonedTime, format } from 'https://esm.run/date-fns-tz';

let poolFlag = false

async function findMemberInfo(email) {
    try {
        const memberInfo = localStorage.getItem("member")
        let info

        if (memberInfo) {
            const member = JSON.parse(memberInfo)
            info = member.find(o => o.email === email)
        }
    
        if (!info) {
            const result = await readAxios()
    
            const member = result.member
            info = member.find(o => o.email === email)
        
            localStorage.setItem("member", JSON.stringify(member))
        }
    
        if (!info) {
            throw new Error("ERR404: Data Not Found")
        }
        return info
    } catch (e) {
        console.error(e)
    }
}

async function readAxios(lastChatId = 0, isPrev = false) {
    if (poolFlag) return { list: [] }
    poolFlag = true

    const token = localStorage.getItem("token")

    const response = await axios({
        method: 'GET',
        url: `https://api.chat.aquaco.work?lastChatId=${lastChatId}&isPrev=${isPrev}`,
        headers: {
            Authorization: token
        }
    })

    const result = response.data

    if (!result.success) {
        alert(result.error)
        return result
    }

    poolFlag = false
    localStorage.setItem("member", JSON.stringify(result.member))

    return result
}

async function readChat(list, isPrev = false) {
    const token = localStorage.getItem("token")
    const email = JSON.parse(atob(token.split('.')[1])).email

    const section = document.querySelector("main > section")
    section.innerHTML = ""

    for (const item of list) {
        const article = document.createElement("article")
        //other
        if (item.chatter !== email) {
            article.classList.add("other")
            article.dataset.no = item.id
            
            const memberInfo = await findMemberInfo(item.chatter)
            
            const profileImageDiv = document.createElement("div")
            //get image file function?
            profileImageDiv.classList.add("image")
            const img = document.createElement("img")
            img.src = `https://api.chat.aquaco.work/profileImage/${item.chatter}`

            profileImageDiv.append(img)

            const chatterDiv = document.createElement("div")
            chatterDiv.classList.add("text")

            const nicknameDiv = document.createElement("div")
            nicknameDiv.classList.add("nickname")
            nicknameDiv.innerText = memberInfo.nickname

            const chatDiv = document.createElement("div")
            chatDiv.classList.add("chat")
            chatDiv.innerText = item.text

            chatterDiv.append(nicknameDiv, chatDiv)

            const datetimeDiv = document.createElement("div")
            datetimeDiv.classList.add("datetime")
            datetimeDiv.innerText = format(utcToZonedTime(new Date(item.datetime)), 'HH:mm')

            article.append(profileImageDiv, chatterDiv, datetimeDiv)
        //me
        } else {
            article.classList.add("me")
            article.dataset.no = item.id

            const datetimeDiv = document.createElement("div")
            datetimeDiv.classList.add("datetime")
            datetimeDiv.innerText = format(utcToZonedTime(new Date(item.datetime)), 'HH:mm')

            const chatDiv = document.createElement("div")
            chatDiv.classList.add("chat")
            chatDiv.innerText = item.text

            article.append(datetimeDiv, chatDiv)
        }
        if (isPrev) {
            section.prepend(article)
        } else {
            section.append(article)   
        }
    }
    const inputChat = document.querySelector("footer > .input > input")
    inputChat.value = ""
}

window.sendMessage = async () => {
    const chat = document.querySelector("footer > .input > input[name='message']").value
    const token = localStorage.getItem("token")
    const email = JSON.parse(atob(token.split('.')[1])).email

    if (!chat) {
        alert("빈칸입니다.")
        return
    }
    const response = await axios({
        method: 'POST',
        url: "https://api.chat.aquaco.work/",
        data: {
            chatter: email,
            text: chat
        },
        headers: {
            Authorization: token
        }
    })

    const result = response.data

    if (!result.success) {
        alert(result.error)
        const read = await readAxios()
        await readChat(read.list.reverse())
    }
}

;(async () => {
    try {
        const token = localStorage.getItem("token")

        if (!token) {
            location.href = "login.html"
        }
        
        const result = await readAxios()      

        if (result.success) {
            await readChat(result.list)
        } else {
            throw new Error(result.error)
        }

        const article = document.querySelectorAll("article")
        const interval = 500

        const resultPool = await new Promise((resolve) => {
            setInterval(async () => {
                const lastChatId = article[article.length - 1].dataset.no
                console.log(lastChatId)
                const resulT = await readAxios(lastChatId)
                resolve(resulT)
            }, interval)
        })

        if (resultPool.list.length) await readChat(resultPool.list)
        // const section = document.querySelector("main > section")

        // for (const item of result.list) {
        //     const article = document.createElement("article")
        //     //other
        //     if (item.chatter !== email) {
        //         const memberInfo = await findMemberInfo(item.chatter)
                
        //         const profileImageDiv = document.createElement("div")
        //         //get image file function?
        //         profileImageDiv.classList.add("image")
        //         const img = document.createElement("img")
        //         img.src = `https://api.chat.aquaco.work/profileImage/${item.chatter}`

        //         profileImageDiv.append(img)

        //         const chatterDiv = document.createElement("div")

        //         const nicknameDiv = document.createElement("div")
        //         nicknameDiv.classList.add("nickname")
        //         nicknameDiv.innerText = memberInfo.nickname

        //         const chatDiv = document.createElement("div")
        //         chatDiv.classList.add("chat")
        //         chatDiv.innerText = item.text

        //         chatterDiv.append(nicknameDiv, chatDiv)

        //         const datetimeDiv = document.createElement("div")
        //         datetimeDiv.classList.add("datetime")
        //         datetimeDiv.innerText = item.datetime

        //         article.append(profileImageDiv, chatterDiv, datetimeDiv)
        //     //me
        //     } else {
        //         const datetimeDiv = document.createElement("div")
        //         datetimeDiv.classList.add("datetime")
        //         datetimeDiv.innerText = format(utcToZonedTime(new Date(item.datetime)), 'HH:mm')

        //         const chatDiv = document.createElement("div")
        //         chatDiv.classList.add("chat")
        //         chatDiv.innerText = item.text

        //         article.append(datetimeDiv, chatDiv)
        //     }
        //     section.append(article)
        // }
    } catch (e) {
        alert("unknown error!")
        console.error(e)
    }
})()