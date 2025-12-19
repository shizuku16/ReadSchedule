document.addEventListener('DOMContentLoaded', async function() {
    const thisMonth=new Date().getMonth()+1;
    const select=document.getElementById("month");
    let string="";
    let selectMonth=thisMonth+1;
    for(let i=1;i<=Math.min(selectMonth,12);i++) string+=`<option>${i}月</option>`;
    select.insertAdjacentHTML("beforeend",string);
    select.value=`${thisMonth}月`;

    //年月のクエリがある場合、その情報で表示する
    const url=new URL(window.location.href);
    if(url.searchParams.has("year") && url.searchParams.has("month")){
        const year = url.searchParams.get("year");
        const month = url.searchParams.get("month");
        //読み込みなおすために一度該当月のキャッシュを消す
        window.sessionStorage.removeItem((`${year}${month}`));

        //再度設定し読み込みなおす
        document.getElementById("year").value=`${year}年`;
        select.value=`${month}月`;  
        await dataGet();
        
        //メンバーのクエリがある場合、その情報で表示する
        memberDisplay(url);
    }
});

//メンバーのクエリがある場合、その情報で表示する関数
function memberDisplay(url){
    if(url.searchParams.has("member")){
        const allMember = url.searchParams.getAll("member");
        url.searchParams.delete("member");
        window.history.replaceState({}, '', url);
        allMember.forEach(value=>{
            document.getElementById("member").value=value;
            display();
        })
    }
}

//表示月が変わったときの処理
async function dataGet(){
    const year=Number(document.getElementById("year").value.replace("年",""));
    const month=Number(document.getElementById("month").value.replace("月",""));
    const member=document.getElementById("member");
    //クエリに表示する年月を追加
    const url = new URL(window.location.href);
    url.searchParams.set("year",year);
    url.searchParams.set("month",month);
    // アドレスバーを更新
    window.history.replaceState({}, '', url);

    while(member.firstChild ){
        member.removeChild( member.firstChild );
    }
    if(window.sessionStorage.getItem(`${year}${month}`)){
        const data=JSON.parse(window.sessionStorage.getItem(`${year}${month}`))
        let string=``;
        for(let i=0;i<Object.keys(data).length-1;i++)
            string+=`<option>${Object.keys(data)[i]}</option>`;
        member.insertAdjacentHTML("beforeend",string);
        member.value="";
        await makeDateTable();
        memberDisplay(url);
        return;
    }
    member.disalbed=true;

    showLoading();
    await fetch(`https://script.google.com/macros/s/AKfycbwIFhLsMlqMGEhSzNBJJDscjV3P-lAh9n_KY0_4XY36oZu7gl0difbRNpggBRY3dNxa/exec?data=${year},${month}`)
    .then(res=>res.json())
    .then(data=>{
        window.sessionStorage.setItem(`${year}${month}`,JSON.stringify(data));
        let string=``;
        for(let i=0;i<Object.keys(data).length-1;i++)
            string+=`<option>${Object.keys(data)[i]}</option>`;
        member.insertAdjacentHTML("beforeend",string);
        member.value="";
        makeDateTable();
        member.disalbed=false;
    })
    .then(function(){
        console.log(url)
        memberDisplay(url);
        hideLoading();        
    })
}

//日付部分のTable作成
function makeDateTable(){
    const year=Number(document.getElementById("year").value.replace("年",""));
    const month=Number(document.getElementById("month").value.replace("月",""));
    const table=document.getElementById("table");
    const data=JSON.parse(window.sessionStorage.getItem(`${year}${month}`));
    if(!data) return;
    let lastDay
    switch (month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            lastDay=31;
            break;
        case 2:
            if(year%4==0) lastDay=29;
            else lastDay=28;
            break;
        default:
            lastDay=30;
            break;
    }
    string=`<tr><td class="header">日付</td></tr>`;
    let day=["日","月","火","水","木","金","土"];
    while(table.firstChild ){
        table.removeChild( table.firstChild );
    }
    data.color=data.color.map(e=>{if(e=="#f1f8ff")return "#D8EBFF";else return e})
    for(let i=1;i<=lastDay;i++)
        string+=`<tr bgcolor="${data.color[i+1]}"><td id="${year}y${month}m${i}d">${month}/${i}(${day[new Date(year,month-1,i).getDay()]})</td></tr>`;
    string+=`<tr id="bikou"><td>備考</td></tr>`;
    table.insertAdjacentHTML("beforeend",string);
    return
}

//メンバーを増やしたときの処理
function display(){
    const year=Number(document.getElementById("year").value.replace("年",""));
    const month=Number(document.getElementById("month").value.replace("月",""));
    const member=document.getElementById("member").value;
    const table=document.getElementById("table");
    const data=JSON.parse(window.sessionStorage.getItem(`${year}${month}`));
    const tableData=table.firstChild.innerHTML.split(/<\/tr>/);
    tableData.pop();
    //既に表示されていたらスキップ
    if(tableData[0].match(member)) return;
    //データ追加
    tableData[0]=tableData[0]+`<td class="header" id="${member}">${member}<button onclick="deleteColumn(this)" id="${member}delete">×</button></td>`;
    for(let i=1;i<tableData.length-1;i++){
        tableData[i]=tableData[i]+`<td style="text-align: center;" id="${member}${i}">${data[member][i-1]}</td>`;
    }
    tableData[tableData.length-1]=tableData[tableData.length-1]+`<td style="width:${member.length*2+2}ch" id="${member}memo">${data[member][31]}</td>`;
    //テーブルを書き換え
    while(table.firstChild ){
        table.removeChild( table.firstChild );
    }
    table.insertAdjacentHTML("beforeend",tableData.join(`</tr>`))
    document.getElementById("table").style.width="2ch";

    //クエリに情報追加
    const url = new URL(window.location.href);
    url.searchParams.append("member",member);
    // アドレスバーを更新
    window.history.replaceState({}, '', url);
}

//メンバーを減らしたときの処理
function deleteColumn(e){
    const member=e.id.replace("delete","")
    document.getElementById(member).remove();
    for(let i=1;i<=31;i++){
        if(!document.getElementById(member+i)) continue;
        document.getElementById(member+i).remove();
    }
    document.getElementById(member+"memo").remove();
    //クエリを一度取得
    const url = new URL(window.location.href);
    const values=url.searchParams.getAll("member").filter(e=>e!=member);
    url.searchParams.delete("member");
    values.forEach(e=>url.searchParams.append("member",e));
    // アドレスバーを更新
    window.history.replaceState({}, '', url);
}