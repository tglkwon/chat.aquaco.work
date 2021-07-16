async function findMemberInfo(email) {
    try {
        const memberInfo = localStorage.getItem("member")
        let infoFlag = false
        let myInfo
        for (const item of memberInfo) {
            if (item.email === email) {
                infoFlag = true
                myInfo = item
                break
            }
        }
    
        if (!infoFlag) {
            await readAxios()
    
            for (const item of memberInfo) {
                if (item.email === email) {
                    infoFlag = true
                    myInfo = item
                    break
                }
            }
        }
    
        if (!infoFlag) {
            throw new Error("ERR404: Data Not Found")
        }
    } catch (e) {
        console.error(e)
    }
}

async function readAxios() {
    const response = await axios({
        method: 'GET',
        url: "https://api.chat.aquaco.work/"
    })

    const result = response.data

    if (!result.success) {
        alert(result.error)
        return
    }

    localStorage.setItem("member", JSON.stringify(result.member))
}

;(async () => {
    try {
        const token = localStorage.getItem("token")

        if (!token) {
            // return
            location.href = "login.html"
        }
        
        await readAxios()

        // const member = localStorage.getItem("member")
        const email = JSON.parse(atob(token.split('.')[1])).email 
        const section = document.querySelector("main > section")

        for (const item of result.list) {
            if (item.chatter !== email) {
                const article = document.createElement("article")
                
                const myInfo = findMemberInfo(email)
                
                const profileImageDiv = document.createElement("div")
                //get image file function?  

                const nicknameDiv = document.createElement("div")
                nicknameDiv.classList.add("nickname")
                nicknameDiv.innerText = myInfo.nickname

                const chatDiv = document.createElement("div")

                const datetimediv = document.createElement("div")


            } else {
                
            }
        }
    } catch (e) {
        alert("unknown error!")
        console.error(e)
    }
})()