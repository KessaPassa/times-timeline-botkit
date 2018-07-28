import User from './User'

const MEMBERS_NAME = ['古川義人', '染谷一輝', '土屋克典', '林敏生', '酒井寛崇', '大場大輔', '原圭範'];
const MEMBERS_ID = ['U4NP14AAZ', 'U7NQVLAUT', 'U7NTL5QL8', 'U7PHBUQ2E', 'U8D5QJ21W', 'U81KX7JTX', 'U96FB2WKE'];

let users = [];
export function setup() {
    for (let i = 0; i < MEMBERS_NAME.length; i++) {
        users.push(new User(MEMBERS_ID[i], MEMBERS_NAME[i]));
    }
    // return users;
}

// export function convertIdToName(id){
//     let index = MEMBERS_ID.indexOf(id);
//     return MEMBERS_NAME[index];
// }
//
// export function convertNameToId(name) {
//     let index = MEMBERS_NAME.indexOf(name);
//     return MEMBERS_ID[index];
// }

export function getUserById(id){
    let index = MEMBERS_ID.indexOf(id);
    return users[index];
}

export function getUserByName(name){
    let index = MEMBERS_NAME.indexOf(name);
    return users[index];
}

export function getOnlyIds(){
    return MEMBERS_ID;
}

export function getOnlyNames(){
    return MEMBERS_NAME;
}