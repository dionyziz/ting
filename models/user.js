function User(name) {
    this.name = name;
}

if (typeof module !== 'undefined') {
    module.exports = User;
}
