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
    if(line.indexOf("｜") > -1)
    // if(line.indexOf("｜") > -1
    //     && line.indexOf("《") > -1
    //     && line.indexOf("》") > -1)
    {
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
    let max = maxChars; // 一行の最大文字数は、オーバーサイズルビによって減少する
    while(true){
        if(str.substr(num, 6) === "<ruby>")
        // if(str.substr(num, 1) === "｜"
        //     && str.substr(num, 2) !== "《")
        {
            // const bar = str.indexOf("｜");
            // const start = str.indexOf("《");
            // const end = str.indexOf("》");
            // const rb = start - bar - 1; // 漢字の文字数
            // const rt = end - start -1; // フリガナの文字数

            // ルビタグの抽出
            const ruby = str.match(/<ruby><rb>([^\x01-\x7E]+)<\/rb><rp>\(<\/rp><rt>([^\x01-\x7E]+)<\/rt><rp>\)<\/rp><\/ruby>/);
            // const rb = str.replace(/<rb>([^\x01-\x7E]+)<\/rb>/g, "$1"); // 漢字
            // const rt = str.replace(/<rt>([^\x01-\x7E]+)<\/rt>/g, "$1"); // フリガナ
            // if(rt > rb * 2){
            // if(rt.length > rb.length * 2){
            //     // 漢字1文字に対しフリガナ3文字だと、スケールは1.5文字分となる。よって最後に Math.ceil
            //     const excess = rt / 2 - rb;
            //     max -= excess; // 超過文字分を、最大文字数から引く
            // }
            scaleTest.innerHTML += ruby[0];
            // if(num + rb > max){
            if(scaleTest.clientHeight > rubyLineHeight){
                console.log("num + rb > max");
                // return Math.floor(max);
                // return Math.floor(max);
                return Math.floor(num);
            } else {
                // 堕天男 -> ｜堕天男《ルシファー》　幅が変わらないので、記号とフリガナ、8文字の増加（フリガナ＋３）
                // 母 -> ｜母《チート》　幅が0.5文字分増える、6文字（フリガナ＋３）増加するが、ルビの増加分、残り文字数が減る
                // num += (rt > rb * 2 ? rt / 2 : rb) + 3; // 漢字とフリガナのスケールを比べ、大きい方を num に足す
                // num += rt + rb + 51; // 本来一文字先に進むところを、ルビならルビタグ全体分進める
                num += ruby[0].length; // 本来一文字先に進むところを、ルビならルビタグ全体分進める
                // num += rt + rb + 3; // 本来一文字先に進むところを、ルビならルビタグ全体分進める
                // max += rt + 3;
                // scaleTest.innerHTML += str.substr(num, 1);
            }
            str = str.replace("<ruby>", "<xxxx>"); // 現在のルビタグの無効化
            // str = str.replace("｜", "‖");
            // str = str.replace("《", "≪");
            // str = str.replace("》", "≫");
        } else {
            scaleTest.innerHTML += str.substr(num, 1);
            if(scaleTest.clientHeight > rubyLineHeight){
                // return Math.floor(max);
                return Math.floor(num);
            } else {
                num++;
            }
        }
        // テスト用の P タグが改行によって変化したら終了
        // if(num >= max){

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
            // return line.substr(lineBreak);
            return [encoded.substr(0, lineBreak), encoded.substr(lineBreak)];
        }
    } else {
        if(line.length > maxChars){
            const line1 = line.substr(0, maxChars);
            const line2 = line.substr(maxChars);
            // return line.substr(maxChars);
            return [encodeRuby(line1), encodeRuby(line2)];
        }
    }
    return [encodeRuby(line), null];
}

const addP = () => {
    // const remain = separateLine(testLine);
    const encodedArray = separateLine(testLine);
    console.log("encodedArray: ");
    console.log(encodedArray);
    let p = document.createElement("p");
    // const encoded = encodeRuby(testLine);
    p.id = ("final_line");
    // if(encoded.indexOf("<ruby>") > -1){
    if(encodedArray[0].indexOf("<ruby>") > -1){
        p.style.height = rubyLineHeight + "px";
    } else {
        p.style.height = lineHeight + "px";
    }
    // p.innerHTML = encoded;
    p.innerHTML = encodedArray[0] + encodedArray[1];
    div.appendChild(p);
}

addP();


// $#########$#########$#########$#########$#########
// メモ
