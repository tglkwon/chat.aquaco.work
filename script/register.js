async function register() {
    try {
        const inputEmail = document.querySelector(`main > .input > input[name="email"]`)
        const inputPassword = document.querySelector(`main > .input > input[name="password"]`)
        const inputPassword2 = document.querySelector(`main > .input > input[name="password2"]`)
        const inputNickname = document.querySelector(`main > .input > input[name="nickname"]`)
        const inputProfileImage = document.querySelector(`main > .input > input[name="profileImage"]`)
        
        const email = inputEmail.value
        const password = inputPassword.value
        const password2 = inputPassword2.value
        const nickname = inputNickname.value    
        const profileImage = inputProfileImage.value

        if (password !== password2) {
            alert("두 비밀번호가 다릅니다.")
            return
        }

        const file = new FormData()
        file.append("email", email)
        file.append("password", password)
        file.append("nickname", nickname)
        file.append("profileImage", profileImage)

        const response = await axios({
            method: 'POST',
            url: "https://api.chat.aquaco.work/member/upload",
            data: file,
            headers: { "Content-Type": "multipart/form-data" }
        })
    
        const result = response.data
    
        if (!result.success) {
            alert(result.error)
            return
        }

        const token = localStorage.setItem("token", token)        

        location.href = "/index.html"
    } catch (error) {
        alert("Unknown Error!")
        console.error(error)
    }
}