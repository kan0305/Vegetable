// JSON 檔案網址
//原始資料出處
// const url = "https://data.coa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx";
const url = "https://hexschool.github.io/js-filter-data/data.json";
const productsList = document.querySelector(".showList");
const buttonGroup = document.querySelector(".button-group");
let data = []; //原始資料
let changeData = []; //修改資料都擺這

//撈取資料function
function getData() {
    productsList.innerHTML = '<tr><td colspan="6" class="text-center p-3">請稍後，資料載入中...</td></tr>';
    axios.get(url).then(function (response) {
        data = response.data;
        changeData = data.filter(item => {
            if(item.作物名稱){ //排除null、undefined
                return item;
            }
        });        
        renderData(changeData);
        countTotalPages(changeData)
        document.querySelector('.modal').style.display = 'none';
    });
    
}
getData();

//pagination 用參數
let perPage = 15;
let start = 0;
let end = perPage;
let currentPage = 1;
let totalPages = 0;

//pagination
const element = document.querySelector(".pagination ul");
function createPagination(totalPages, currentPage){
  let liTag = '';
  let active;
  let beforePage = currentPage - 1;
  let afterPage = currentPage + 1;
  if(currentPage > 1){ //show the next button if the page value is greater than 1
    liTag += `<li class="btn prev" onclick="createPagination(totalPages, ${currentPage - 1})"><span><i class="fas fa-angle-left"></i> Prev</span></li>`;
  }

  if(currentPage > 2){ //if page value is greater than 2 then add 1 after the previous button
    if(totalPages != 3 && totalPages != 4){ // 總頁數不等於3或4才會正常
      liTag += `<li class="first numb" onclick="createPagination(totalPages, 1)"><span>1</span></li>`;
      if(currentPage > 3){ //if page value is greater than 3 then add this (...) after the first li or page
        liTag += `<li class="dots"><span>...</span></li>`;
      }
    }    
  }

  // how many pages or li show before the current li
  if (currentPage == totalPages) {
    beforePage = beforePage - 2;
  } else if (currentPage == totalPages - 1) {
    beforePage = beforePage - 1;
  }
  // how many pages or li show after the current li
  if (currentPage == 1) {
    afterPage = afterPage + 2;
  } else if (currentPage == 2) {
    afterPage = afterPage + 1;
  }

  //顯示頁數
  for (var plength = beforePage; plength <= afterPage; plength++) {
    if (plength > totalPages || plength < 0) { //if plength is greater than totalPage length then continue
      continue;
    }
    if (plength == 0) { //if plength is 0 than add +1 in plength value
      plength = plength + 1;
    }
    if(currentPage == plength){ //if page is equal to plength than assign active string in the active variable
      active = "active";
    }else{ //else leave empty to the active variable
      active = "";
    }
    liTag += `<li class="numb ${active}" onclick="createPagination(totalPages, ${plength})"><span>${plength}</span></li>`;
  }

  if(currentPage < totalPages - 1){ //if page value is less than totalPage value by -1 then show the last li or page    
    if(totalPages != 3 && totalPages != 4){ 
      if(currentPage < totalPages - 2){ //if page value is less than totalPage value by -2 then add this (...) before the last li or page
        liTag += `<li class="dots"><span>...</span></li>`;
      }
      liTag += `<li class="last numb" onclick="createPagination(totalPages, ${totalPages})"><span>${totalPages}</span></li>`;      
    }
  }

  if (currentPage < totalPages) { //show the next button if the page value is less than totalPage(20)
    liTag += `<li class="btn next" onclick="createPagination(totalPages, ${currentPage + 1})"><span>Next <i class="fas fa-angle-right"></i></span></li>`;
  }
  getCurrentPage(currentPage);
  renderData(changeData);
  element.innerHTML = liTag;//add li tag inside ul tag
  return liTag; //reurn the li tag
}

//countTotalPages
function countTotalPages(data){
    totalPages = Math.ceil(data.length / perPage);
    element.innerHTML = createPagination(totalPages, currentPage);
}

//getCurrentPage
function getCurrentPage(currentPage){
    start = (currentPage - 1) * perPage;
    end = currentPage * perPage;
}

//渲染資料function
function renderData(showData) {   
    let str = "";
    showData.forEach((item,index) => {
        if(index >= start && index < end){
            str += `<tr>
            <td>${item.作物名稱}</td>
            <td>${item.市場名稱}</td>
            <td>${item.上價}</td>
            <td>${item.中價}</td>
            <td>${item.下價}</td>
            <td>${item.平均價}</td>
            <td>${item.交易量}</td>
            </tr>`;
        }        
    });
    productsList.innerHTML = str;
}

//蔬果、水果、花卉按鈕篩選資料
const buttonList = document.querySelectorAll('.button-group button'); //物種類別按鈕
buttonGroup.addEventListener("click", function (e) {
    let type = e.target.dataset.type;
    let filterData = [];
    // currentPage = 1;

    buttonList.forEach((item) => {
        item.classList.remove('active'); //移除active
    })
    if (e.target.nodeName == 'BUTTON') {
        e.target.classList.add('active'); //點選的按鈕class加上active 
        filterData = filterByType(data, type);
        if(filterData.length != 0){
            // changeData = [];
            changeData = filterData;
            renderData(changeData);
        }else{
            productsList.innerHTML = '<tr><td colspan="6" class="text-center p-3">查詢不到交易資訊QQ</td></tr>';
        }
    }    
    countTotalPages(changeData);
});

//透過type篩選資料function
function filterByType(data,type){
    if(type == 'All'){
        return data.filter(item => {
            if(item.作物名稱){
                return item
            }
        });
    }    
    return data.filter(item => {
        if(item.作物名稱){ //過濾掉空值、null、undefined
            return item.種類代碼 == type;
        }       
    });
}

//搜尋資料
const search = document.querySelector('.search-group');
search.addEventListener('click', e => { 
    if(e.target.nodeName == 'BUTTON'){
        const input = document.querySelector('input');
        if(input.value.trim() == ''){
            alert('請輸入作物名稱');
            return
        }

        changeData = data.filter(item => {
            if(item.作物名稱){ //過濾掉null、undefined
                return item.作物名稱.match(input.value);
            }
        })
        if(changeData.length == 0){
            productsList.innerHTML = '<tr><td colspan="6" class="text-center p-3">查詢不到交易資訊QQ</td></tr>';
            element.classList.add('active');
        }else{            
            element.classList.remove('active');
            renderData(changeData);
            countTotalPages(changeData); 
        }
        buttonList.forEach((item) => {
          item.classList.remove('active'); //移除active
        });
        input.value = '';        
    }
})

//排序資料(透過select)
const select = document.querySelector('.sort-select');

//註冊監聽 select 的 change 事件'
select.addEventListener('change', e => {
  switch(e.target.value){
      case '依上價排序':
        // console.log('上價');
        selectChange('上價');
        break;
      case '依中價排序':
        // console.log('中價');
        selectChange('中價');
        break;
      case '依下價排序':
        // console.log('下價');
        selectChange('下價');
        break;
      case '依平均價排序':
        // console.log('平均價');
        selectChange('平均價');
        break;
      case '依交易量排序':
        // console.log('交易量');
        selectChange('交易量');
        break;
  }
})

function selectChange(value){
//   changeData = changeData.filter(item => item[value] != '0');
  changeData.sort((a,b) => b[value] - a[value]); //大到小
  // console.log(changeData);
  renderData(changeData);
}

// //切換大小排序
const sortAdvanced = document.querySelector(".js-sort-advanced");
sortAdvanced.addEventListener('click', e => {
  const valueList = document.querySelectorAll('.sort-advanced');
  valueList.forEach(item => {
    if(e.target == item){
      let itemSort = item.dataset.sort;
      let itemPrice = item.dataset.price;
    //   let sortData = changeData;
      
      //點選文字自動排序
      if(itemSort == 'up'){
         item.dataset.sort = 'down';
         changeData.sort((a,b) => a[itemPrice] - b[itemPrice]);
      }else{
        item.dataset.sort = 'up';
        changeData.sort((a,b) => b[itemPrice] - a[itemPrice]);
      }
      renderData(changeData);
    }
  })
})

//手機板排序資料(透過select)
const selectMobile = document.querySelector('#js-mobile-select');

//註冊監聽 select 的 change 事件'
selectMobile.addEventListener('change', e => {
  switch(e.target.value){
      case '上價':
        // console.log('上價');
        selectChange('上價');
        break;
      case '中價':
        // console.log('中價');
        selectChange('中價');
        break;
      case '下價':
        // console.log('下價');
        selectChange('下價');
        break;
      case '平均價':
        // console.log('平均價');
        selectChange('平均價');
        break;
      case '交易量':
        // console.log('交易量');
        selectChange('交易量');
        break;
  }
})