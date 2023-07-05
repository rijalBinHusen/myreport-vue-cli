const signOut = () => {
    localStorage.removeItem('loginya')
    localStorage.removeItem('loginActivity')
    localStorage.removeItem('lastActivity')
    location.reload()
}

export default signOut