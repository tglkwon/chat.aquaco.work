async function login() {
    try {
        const id = document.querySelector("main > .id").value
        const password = document.querySelector("main > .password").value
        
        const res = await axios({
            method: 'post',
            url: 'https://api.chat.aquaco.work/member/login',
            data: {
                id,
                password
            }
        })
        
        if(res.data.success) {
            localStorage.setItem("token", res.data.token) 
            location.href = "/"
        } else {
            throw new Error()
        }
    } catch(e) {
        alert("로그인 실패")
        console.error(e)
    }
}