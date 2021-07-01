async function register() {
    try {
        const id = document.querySelector("main > .id").value
        const nickname = document.querySelector("main > .nickname").value
        const password = document.querySelector("main > .password").value
        const password2 = document.querySelector("main > .password2").value
        const profileImageLink = document.querySelector("main > .profileImage")
        
        if(password !== password2) {
            alert("비밀번호가 같지 않습니다.")
        }
    
        const fd = new FormData()
        fd.append("id", id)
        fd.append("password", password)
        fd.append("nickname", nickname)
        fd.append("profileImageLink", profileImageLink.files[0])
        
        const res = await axios({
            method: 'post',
            url: 'https://api.chat.aquaco.work/member',
            data: fd,
            headers: {
                 "Content-Type": "multipart/form-data" 
            }
        })

        if(res.data.success) {
            location.href = "login.html"
        }
    } catch(e) {
        alert("회원가입 실패")
        console.error(e)
    }
}