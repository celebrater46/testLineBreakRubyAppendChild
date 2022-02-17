"use strict";

let div = document.getElementById("box");
const p = document.getElementById("scale_p");
const pRuby = document.getElementById("scale_p_ruby");
const maxWidth = p.clientWidth; // 一行の最大幅
const lineHeight = p.clientHeight; // 一行の高さ（ルビなし）
const rubyLineHeight = pRuby.clientHeight; // 一行の高さ（ルビあり）
const fontSize = 20;
const maxChars = Math.floor(maxWidth / fontSize); // 1行あたりの最大文字数
const testLine = "「あのさ、｜空《スーパースウィート・スカイハニー》ちゃん。｜今度《ネクスト》の｜休み《ヴァケーション》、よかったら｜ご飯《サイゼリア》でも一緒にどうかな。なんて」";

const encodeRuby = (line) => {
    if(line.indexOf("｜") > -1){
        return line.replace(
            /｜([^《]+)《([^》]+)》/g,
            "<ruby><rb>$1</rb><rp>(</rp><rt>$2</rt><rp>)</rp></ruby>"
        );
    }
    return line;
}

// encodeRuby() の逆
const decodeRuby = (line) => {
    let str = line;
    if(str.indexOf("<ruby><rb>") > -1) {
        str = str.replace(
            /<ruby><rb>([^\x01-\x7E]+)<\/rb><rp>\(<\/rp><rt>([^\x01-\x7E]+)<\/rt><rp>\)<\/rp><\/ruby>/g,
            "｜$1《$2》"
        );
        return str;
    }
}

// オーバーサイズルビがある場合、何文字にしたら一行に収まるか返す
const getIndexOfLineBreak = (encodedLine) => {
    let scaleTest = document.getElementById("scale_test");
    scaleTest.innerHTML = "";
    let str = encodedLine;
    let num = 0;
    while(true){
        if(str.substr(num, 6) === "<ruby>") {
            // ルビタグの抽出
            const ruby = str.match(/<ruby><rb>([^\x01-\x7E]+)<\/rb><rp>\(<\/rp><rt>([^\x01-\x7E]+)<\/rt><rp>\)<\/rp><\/ruby>/);
            scaleTest.innerHTML += ruby[0];
            if(scaleTest.clientHeight > rubyLineHeight){
                return Math.floor(num);
            } else {
                num += ruby[0].length; // 本来一文字先に進むところを、ルビならルビタグ全体分進める
            }
            str = str.replace("<ruby>", "<xxxx>"); // 現在のルビタグの無効化
        } else {
            scaleTest.innerHTML += str.substr(num, 1);
            if(scaleTest.clientHeight > rubyLineHeight){
                return Math.floor(num);
            } else {
                num++;
            }
        }
        if(num > 5000){
            return -1; // 無限ループエラー対策
        }
    }

}

const separateLine = (line) => {
    const hasRuby = line.indexOf("｜");
    if(hasRuby > -1 && hasRuby < maxChars){
        const encoded = encodeRuby(line);
        // ルビが１行内にあるなら、新しい改行ポイント indexOf を取得
        const lineBreak = getIndexOfLineBreak(encoded);
        console.log("lineBreak: " + lineBreak);
        // １行で収まりきらない場合は分割
        if(encoded.length > lineBreak){
            return [encoded.substr(0, lineBreak), encoded.substr(lineBreak)];
        }
    } else {
        if(line.length > maxChars){
            const line1 = line.substr(0, maxChars);
            const line2 = line.substr(maxChars);
            return [encodeRuby(line1), encodeRuby(line2)];
        }
    }
    return [encodeRuby(line), null];
}

const addP = () => {
    const encodedArray = separateLine(testLine);
    console.log("encodedArray: ");
    console.log(encodedArray);
    let p = document.createElement("p");
    p.id = ("final_line");
    if(encodedArray[0].indexOf("<ruby>") > -1){
        p.style.height = rubyLineHeight + "px";
    } else {
        p.style.height = lineHeight + "px";
    }
    p.innerHTML = encodedArray[0] + encodedArray[1];
    div.appendChild(p);
}

addP();
