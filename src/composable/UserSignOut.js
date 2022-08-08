const signOut = () => {
    localStorage.removeItem('loginya')
    localStorage.removeItem('loginActivity')
    location.reload()
}

export default signOut