"use strict";

let div = document.getElementById("box");
const p = document.getElementById("scale_p");
const pRuby = document.getElementById("scale_p_ruby");
const maxWidth = p.clientWidth; // 一行の最大幅
const lineHeight = p.clientHeight; // 一行の高さ（ルビなし）
const rubyLineHeight = pRuby.clientHeight; // 一行の高さ（ルビあり）
const fontSize = 20;
const maxChars = Math.floor(maxWidth / fontSize); // 1行あたりの最大文字数
const testLine = "「あのさ、｜空《スカイ・ハニー》ちゃん。｜今度《ネクスト》の｜休み《ヴァケーション》、よかったら｜ご飯《サイゼリア》でも一緒にどうかな。なんて」";


// 実際に appendChild() することなく、オーバーサイズルビ含む行を数値計算だけで分割する
// 1行あたりの最大文字数内にオーバーサイズルビがあるか確認する
// ルビが最大文字数内にある場合、
// ルビ漢字とフリガナの文字数を両方検出して、
// 長い方が行の外にはみ出すかどうかを検出する。
// フリガナの方は漢字の2倍が長さとなる。
// ルビが行に収まるならルビ行、そうでないならルビなし行。
// 改行ルビ跨ぎ問題があるので、オーバーサイズがあるかないかはあまり関係ない

// 禁則処理の問題もある。最終行の最終文字が
// 「　『　【　（　《　〈　――　……　などであった場合、
// あるいは次ページの最初の文字が
// ー　、　。　」　』　】　）　》　〉　――　……　などであった場合、
// 次のページに回す必要がある。
// これは特殊ルビ処理の後でやるべき。

// 数値計算なら、<ruby>にエンコードする必要はないんじゃなかろうか。

// const lineIncludesRuby = (line) => {
//     if(line.indexOf("<ruby>") > -1){
//         // console.log("ruby exists");
//     }
// }

// エスケープした山括弧を元に戻す
const getBackMountBracket = (line) => {
    let str = line;
    str = str.replace(/〈〈([^〉]+)〉〉/g, "《$1》");
    // str = str.replace(/〈〈/g, "《");
    // str = str.replace(/〉〉/g, "》");
    return str;
}

// 「｜《」など、山括弧をそのまま使いたい場合のエスケープ処理
// 《》をいったん〈〈　〉〉に変換する
const escapeMountBracket = (line) => {
    // const zenkaku = /(?:[　！”＃＄％＆’（）＊＋，－．／：；＜＝＞？＠［￥］＾＿‘｛｜｝￣])|(?:[、。・゛゜´｀¨ヽヾゝゞ〃仝々〆〇ー―‐＼～～∥…‥“〔〕〈〉《》「」『』【】±×÷≠≦≧∞∴♂♀°′″℃￠￡§☆★○●◎◇◇◆□■△▲▽▼※〒→←↑↓〓])|(?:[０-９])|(?:[Ａ-Ｚ])|(?:[ａ-ｚ])|(?:[ぁ-ん])|(?:[ァ-ヶ])|(?:[Α-Ωα-ω])|(?:[А-Яа-я])|(?:[\u2570-\u25ff])|(?:[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g;
    if(line.indexOf("｜《") > -1){
        // const line = "<6>大晦日</6>";
        // const replaced = line.replace(/\<([1-7])\>(.*)\<\/.\>/g, "<span class='f$1'>$2</span>"); // <span class='f6'>大晦日</span>
        return line.replace(/｜《([^\x01-\x7E]*)》/g, "〈〈$1〉〉");
    }
    return  line;
}

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
    // if(str.search(/<ruby><rb>[^\x01-\x7E]+<\/rb><rp>\(<\/rp><rt>[^\x01-\x7E]+<\/rt><rp>\)<\/rp><\/ruby>/) > -1)
    if(str.indexOf("<ruby><rb>") > -1)
    // if(str.indexOf("<ruby><rb>") > -1
    //     && str.indexOf("</rb><rp>(</rp><rt>") > -1
    //     && str.indexOf("</rt><rp>)</rp></ruby>") > -1)
    {
        str = str.replace(
            /<ruby><rb>([^\x01-\x7E]+)<\/rb><rp>\(<\/rp><rt>([^\x01-\x7E]+)<\/rt><rp>\)<\/rp><\/ruby>/g,
            "｜$1《$2》"
        );
        // str = str.replace(/<ruby><rb>/g, "｜");
        // str = str.replace(/<\/rb><rp>\(<\/rp><rt>/g, "《");
        // str = str.replace(/<\/rt><rp>\)<\/rp><\/ruby>/g, "》");
        return str;
    }
}

const oversizeExists = (line) => {
    return true;
}

// オーバーサイズルビがある場合、何文字にしたら一行に収まるか返す
const getIndexOfLineBreak = (line) => {
    let str = line;
    let num = 0;
    let max = maxChars; // 一行の最大文字数は、オーバーサイズルビによって減少する
    // let betweenRuby = false; // ルビ指定（｜《》）の途中なら true
    while(true){
        if(str.substr(num, 1) === "｜"
            && str.substr(num, 2) !== "《")
        {
            // betweenRuby = true;
            const bar = str.indexOf("｜");
            const start = str.indexOf("《");
            const end = str.indexOf("》");
            const rb = start - bar - 1; // 漢字の文字数
            const rt = end - start -1; // フリガナの文字数
            console.log("bar: " + bar);
            console.log("start: " + start);
            console.log("end: " + end);
            console.log("str: " + str);
            console.log("rb: " + rb);
            console.log("rt: " + rt);
            if(rt > rb * 2){
                // 漢字1文字に対しフリガナ3文字だと、スケールは1.5文字分となる。よって最後に Math.ceil
                const excess = rt / 2 - rb;
                max -= excess; // 超過文字分を、最大文字数から引く
                console.log("excess: " + excess);
                console.log("max: " + max);
            }
            if(num + rb > max){
                // const tempMax = Math.floor(max);
                // const tempStr = str.substr(tempMax);
                console.log("num + rb > max");
                return Math.floor(max);
            } else {
                // 堕天男 -> ｜堕天男《ルシファー》　幅が変わらないので、記号とフリガナ、8文字の増加（フリガナ＋３）
                // 母 -> ｜母《チート》　幅が0.5文字分増える、6文字（フリガナ＋３）増加するが、ルビの増加分、残り文字数が減る
                // num += (rt > rb * 2 ? rt / 2 : rb) + 3; // 漢字とフリガナのスケールを比べ、大きい方を num に足す
                num += rt + rb + 3; // 本来一文字先に進むところを、ルビならルビタグ全体分進める
                max += rt + 3;
                // 開業する前にルビエンコードしたい｜《》の補正値（＋３）だと
                // max += rt + 51;
            }
            // str = str.replace(/｜(.*)《(.*)》/, "‖$1≪$2≫"); // なぜか二重山括弧だけ2番め以降が変換される
            str = str.replace("｜", "‖");
            str = str.replace("《", "≪");
            str = str.replace("》", "≫");
        }
        if(num >= max){
            console.log("num >= maxChars");
            console.log("max: " + max);
            return Math.floor(max);
        } else {
            num++;
            // betweenRuby = false;
        }
        if(num > 5000){
            return -1; // 無限ループエラー対策
        }
    }

}

const separateLine = (line) => {
    // const ruby = line.indexOf("<ruby>");
    const ruby = line.indexOf("｜");
    if(ruby > -1 && ruby < maxChars){
        // ルビが１行内にあるなら、新しい改行ポイント indexOf を取得
        const lineBreak = getIndexOfLineBreak(line);
        // console.log("ruby exists");
        console.log("lineBreak: " + lineBreak);
        // const encoded = encodeRuby(line);
        // １行で収まりきらない場合は分割
        if(line.length > lineBreak){
            return line.substr(lineBreak);
            // return [line.substr(0, lineBreak), line.substr(lineBreak)];
            // return [encoded.substr(0, lineBreak), encoded.substr(lineBreak)];
        }
    } else {
        if(line.length > maxChars){
            return line.substr(maxChars);
            // return [line.substr(0, maxChars), line.substr(maxChars)];
            // return [encoded.substr(0, maxChars), encoded.substr(maxChars)];
        }
    }
    return [line, null];
}

const addP = (line) => {
    // const array = separateLine(testLine);
    const remain = separateLine(testLine);
    // console.log("array");
    // console.log(array);
    // console.log("array[0]: " + array[0]);
    let p = document.createElement("p");
    // const encoded = encodeRuby(array[0]);
    const encoded = encodeRuby(testLine);
    console.log("encoded: " + encoded);
    console.log("remain: " + remain);
    p.id = ("final_line");
    if(encoded.indexOf("<ruby>") > -1){
        p.style.height = rubyLineHeight + "px";
    } else {
        p.style.height = lineHeight + "px";
    }
    p.innerHTML = encoded;
    div.appendChild(p);
}

// console.log(separateLine(testLine));
addP();
// console.log(separateLine(encodeRuby(testLine)));
// const str = "俺の名は｜堕天男《ルシファー》。";
// const replaced = str.replace(/｜(.*)《(.*)》/g, "<ruby><rb>$1</rb><rp>(</rp><rt>$2</rt><rp>)</rp></ruby>");
// console.log(replaced);

// const str = "俺の名は｜《ルシファー》――";
// const replaced = str.replace(/｜《(.*)》/g, "〈〈$1〉〉");
// console.log(replaced);

const testLine2 = "１２３４５｜６《だだだだだ》７８９｜０《ぜろ》１２３４５｜６《シックス》７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０";

// console.log(testLine2.replace(/｜(.*)《(.*)》/, "‖$1≪$2≫"));

// console.log("maxChars: " + maxChars);
// console.log(getIndexOfLineBreak(testLine2));

// let newP = document.createElement("p");
// newP.innerHTML = encodeRuby(testLine);
// div.appendChild(newP);



// $#########$#########$#########$#########$#########
// メモ

// ルビ指定の途中で改行されている。正規表現を使ってルビ指定全体を抽出した方が確実に処理できるかも。
// ルビエンコードを実行しても、たぶんタグの途中で改行される
// 改行ポイントがルビ指定の途中かどうかチェックして、途中なら改行ポイントを後ろにずらす必要がありそう。



// $#########$#########$#########$#########$#########
// 220217

// 改行ポイントがルビ指定の途中であるパターンは、

// A「ルビ自体は行に収まるオーバーサイズルビ」パターン
// B「ルビは行に収まらないオーバーサイズルビ」パターン
// C「ルビ自体は行に収まる通常ルビ」パターン
// D「ルビは行に収まらない通常ルビ」パターン


// ページの最後の行、実際に1行に収まる文字数に切り取ってしまうと、
// 均等割り付けがうまく機能しない問題が生じるようだ。
// これを回避するには、実際には文字の切り取りは行わずに、2行目以降が見えなくなるようにするのがいい

// 結論。計算だけでオーバーサイズルビありの行を正確に切り抜くのは
// フォントや前後の文字との関係によってスケールが複雑に変化するので困難を極める。
// 従来の実際に文字を追加していって実測する仕組みの方が確実であり、
// overflow: hidden にして実際には P タグの中に全文字入れて 2 行目以降を
// 非表示とすることで大きなレイアウト崩れを裂けつつ均等割り付けを適用するのが
// 最適解かと思われる。

// 禁則処理、overflow: hidden で半分は解決する。
// 次のページの最初の文字だけ処理すればよさそう。