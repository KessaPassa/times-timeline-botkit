// -------- 内部用 --------

// エラー箇所を関数名で示す
export function error(function_name) {
    return 'error: ' + function_name;
}

// -------- End --------

// -------- botに喋らせる用(cv: エルフのえる) --------
export function header() {
    return 'える知ってるよ〜。';
}

// add
export function add() {
    return 'メモを追加したよ';
}

//list(Database)
export function list_header() {
    return '【ここのメモ帳だよ】';
}

export function none_memo(){
    return 'メモはないよ';
}

// remove
export function cant_data() {
    return header() + 'データがないんだよ〜';
}

export function cant_remove() {
    return header() + 'その番号ないんだよ〜';
}

export function removed(num) {
    return `${num}番のメモを削除したよ`;
}


// room
export function allreadyLogin(){
    return 'もうログインしてるよ';
}

export function login(){
    return 'いらっしゃ〜いだよ';
}

export function alreadyLogout(){
    return 'もうログアウトしてるよ';
}

export function logout(){
    return 'お疲れ様だよ';
}


// timeline
export function cant_chat() {
    return 'ここで喋っちゃダメなんだよ〜';
}

// Common
export function wrong_arguments() {
    return '引数が間違ってるよ〜';
}

// module.exports = class Messages {
//
//     // -------- 内部用 --------
//
//     // エラー箇所を関数名で示す
//     static error(function_name) {
//         return 'error: ' + function_name;
//     }
//
//     // -------- End --------
//
//     // -------- botに喋らせる用(cv: エルフのえる) --------
//     static getChannels header() {
//         return 'える知ってるよ〜。';
//     }
//
//     // add
//     static getChannels add() {
//         return 'メモを追加したよ';
//     }
//
//     //list(Database)
//     static getChannels list_header() {
//         return '【ここのメモ帳だよ】';
//     }
//
//     // remove
//     static getChannels cant_data() {
//         return Messages.header() + 'データがないんだよ〜';
//     }
//
//     static getChannels cant_remove() {
//         return Messages.header() + 'その番号ないんだよ〜';
//     }
//
//     static removed(num) {
//         return `${num}番のメモを削除したよ`;
//     }
//
//     // Common
//     static getChannels wrong_arguments() {
//         return '引数が間違ってるよ〜';
//     }
//
//     // -------- End --------
//
//     // static getCallStack() {
//     // try {
//     //     throw new Error("DUMMY");
//     // } catch(e) {
//     //     return e.stack.split(/[\r\n]+/).filter(function(v,v2,v3){
//     //         return /^    at .*:[0-9]+:[0-9]+/.test(v);
//     //     });
//     // }
// }
