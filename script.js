document.addEventListener('DOMContentLoaded', function() {
    const thisMonth=new Date().getMonth()+1;
    const select=document.getElementById("month");
    let string="";
    let selectMonth=new Date().getDate()>=15?thisMonth+1:thisMonth
    for(let i=1;i<=selectMonth;i++) string+=`<option>${i}月</option>`;
    select.insertAdjacentHTML("beforeend",string);
    select.value=`${thisMonth}月`;

});

function dataGet(){
    const year=Number(document.getElementById("year").value.replace("年",""));
    const month=Number(document.getElementById("month").value.replace("月",""));
    const member=document.getElementById("member");
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
        makeDateTable();
        return;
    }
    member.disalbed=true;

    fetch(`https://script.google.com/macros/s/AKfycbwIFhLsMlqMGEhSzNBJJDscjV3P-lAh9n_KY0_4XY36oZu7gl0difbRNpggBRY3dNxa/exec?data=${year},${month}`)
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
}

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
    string=`<tr class="header"><td>日付</td></tr>`;
    let day=["日","月","火","水","木","金","土"];
    while(table.firstChild ){
        table.removeChild( table.firstChild );
    }
    data.color=data.color.map(e=>{if(e=="#f1f8ff")return "#D8EBFF";else return e})
    for(let i=1;i<=lastDay;i++)
        string+=`<tr bgcolor="${data.color[i+1]}"><td id="${year}y${month}m${i}d">${month}/${i}(${day[new Date(year,month-1,i).getDay()]})</td></tr>`;
    string+=`<tr id="bikou"><td>備考</td></tr>`;
    table.insertAdjacentHTML("beforeend",string)
}

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
    tableData[0]=tableData[0]+`<td id="${member}">${member}<button onclick="deleteColumn(this)" id="${member}delete">×</button></td>`;
    for(let i=1;i<tableData.length-1;i++){
        tableData[i]=tableData[i]+`<td style="text-align: center;" id="${member}${i}">${data[member][i-1]}</td>`;
    }
    tableData[tableData.length-1]=tableData[tableData.length-1]+`<td style="width:${member.length*2+2}ch" id="${member}memo">${data[member][31]}</td>`;
    //テーブルを書き換え
    while(table.firstChild ){
        table.removeChild( table.firstChild );
    }
    table.insertAdjacentHTML("beforeend",tableData.join(`</tr>`))
    document.getElementById("table").style.width="2ch"
}

function deleteColumn(e){
    const member=e.id.replace("delete","")
    document.getElementById(member).remove();
    for(let i=1;i<=31;i++){
        if(!document.getElementById(member+i)) continue;
        document.getElementById(member+i).remove();
    }
    document.getElementById(member+"memo").remove();
}