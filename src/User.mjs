const _id = Symbol();
const _name = Symbol();

class User{
    constructor(id, name){
        // this.id = id;
        // this.name = name;
        this[_id] = id;
        this[_name] = name;
    }

    get Id(){
        return this[_id];
    }

    get Name(){
        return this[_name];
    }
}

export default User;
