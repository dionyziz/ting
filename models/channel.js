function Channel(name) {
    this.name = name;
    this.messages = [];
    this.users = [];
}

if (typeof module !== 'undefined') {
    module.exports = Channel;
}
