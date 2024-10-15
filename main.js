//God forgive me for I have written the most dogshit and unreadable code in the history of humankind 💀💀
//Made by Sabbir Shimanto(23201086), Brac University


//gotta refactor this code :""""(


async function fetchJsonData(){
    const response = await fetch('https://usis-cdn.eniamza.com/usisdump.json');
    //const response = await fetch('usisdump.json');
    const data = await response.json();

    // sort the data according to sections
    //This code was ripped off from preprereg git repo 💀
    data.sort(function(a, b) {
        return a["courseDetails"].localeCompare(b["courseDetails"]);
    });
    
    return data;
}


//Course selector list filters
let courseCodeFilterArray = [];
let courseTimeFilter = '';
let courseDayFilter = '';

let tablesMade = 0;
let tableIds = [];



async function main(){
    const courseCodeInputEl = document.getElementById('course-code-input');
    const courseCodeItemAddButtonEl = document.getElementById('course-code-item-add-btn');
    const courseCodeItemsContainerEl = document.querySelector('.course-code-items-container');
    const courseListEl = document.querySelector('.course-list');
    const courseTimeFilterContainerEl = document.querySelector('.course-time-filter-container');
    const courseDayFilterContainerEl = document.querySelector('.course-day-filter-container');
    const courseTimeFilterSelectEl = document.getElementById('course-time-select');
    const courseDayFilterSelectEl = document.getElementById('course-day-select');

    const newTableBtnEl = document.querySelector('.new-table-btn');
    const nextTableBtnEl = document.querySelector('.next-table-btn');
    const prevTableBtnEl = document.querySelector('.prev-table-btn');
    const delTableBtnEl = document.querySelector('.del-table-btn');
    const clearTableBtnEl = document.querySelector('.clear-table-btn');
    const downloadTableBtnEl = document.querySelector('.download-table-btn');
    const compareTableBtnEl = document.querySelector('.compare-table-btn');

    const navBarItemsList = document.querySelector('.nav-item-list');


    coursesData = await fetchJsonData();



    //Event callback functions

    navBarItemsList.addEventListener('click', e => {
        let targetEl = e.target;
        if(targetEl.nodeName === 'I'){
            targetEl = targetEl.parentNode;
        }

        let navFunction = targetEl.dataset.navfunc;
        expandNavBar(navFunction);
    })

    //Adding a course code to the course code filter
    courseCodeItemAddButtonEl.addEventListener('click', e => {
        courseCode = courseCodeInputEl.value.toUpperCase();
        addCourseCodetoFilter(courseCode);
        updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, courseDayFilter);
    });

    //delete a course code from the course code filter
    courseCodeItemsContainerEl.addEventListener('click', e => {
        el = e.target;
        if(el.nodeName === 'I'){
            el = el.parentNode;
        }
        
        if(el.getAttribute('id') === 'course-code-item-delete-btn'){
            //removing the item from the filter array as well
            courseCode = el.parentNode.firstChild.nodeValue;
            deleteCourseCodeFromFilter(courseCode);
            updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, courseDayFilter);
        }
        
    });

    //pushing a course to the routine table if double clicked on the course item
    courseListEl.addEventListener('dblclick', e => {
        let targetEl = e.target;

        if(targetEl.nodeName === 'P'){
            targetEl = targetEl.parentNode;
        }
    
        if (!(targetEl.classList.contains('course-list-item-container'))){
            return;
        }
        courseId = parseInt(targetEl.dataset.courseid);
        pushToActiveTable(getCourseObjectFromId(courseId));

        //playing the anim
        targetEl.addEventListener('animationend', e=>{
            targetEl.classList.remove('animate');
        })
        targetEl.classList.add('animate');

        
    });

    newTableBtnEl.addEventListener('click', e => {
        makeTable();
    });

    nextTableBtnEl.addEventListener('click', e=> {
        const activeTable = document.querySelector('.table.active');
        const activeTableId = parseInt(activeTable.dataset.tableid);

        
        if (tableIds.indexOf(activeTableId) + 1 === tableIds.length){
            return;
        }

        let nextTableId = tableIds[tableIds.indexOf(activeTableId) + 1];
        
        showTable(nextTableId);
    });

    prevTableBtnEl.addEventListener('click', e => {
        const activeTable = document.querySelector('.table.active');
        const activeTableId = parseInt(activeTable.dataset.tableid);

        if(tableIds.indexOf(activeTableId) === 0){
            return;
        }

        let prevTableId = tableIds[tableIds.indexOf(activeTableId) - 1];

        showTable(prevTableId);
    });

    delTableBtnEl.addEventListener('click', e => {
        deleteActiveTable();
    });

    clearTableBtnEl.addEventListener('click', e=>{
        clearActiveTable();
    });

    downloadTableBtnEl.addEventListener('click', e => {
        downloadActiveTableImage();
    });

    compareTableBtnEl.addEventListener('click', e => {
        showComparisonTable();
    });



    //Time Filter selection box
    courseTimeFilterSelectEl.addEventListener('change', e => {
        time = courseTimeFilterSelectEl.value;

        if(time === 'none'){
            deleteTimeFromFilter();
            updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, courseDayFilter)
            return;
        }

        setTimeToFilter(time);
        updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, courseDayFilter);
    });


    //Time filter delete button
    courseTimeFilterContainerEl.addEventListener('click', e => {

        targetEl = e.target;
        if(targetEl.getAttribute('id') === 'course-time-delete-btn'){
            deleteTimeFromFilter();
            updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, courseDayFilter);
        }

        
        

    });

    //Day filter selection box
    courseDayFilterSelectEl.addEventListener('change', e => {
        day = courseDayFilterSelectEl.value;
        if(day === 'none'){
            deleteDayFromFilter();
            updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, courseDayFilter)
            return;
        }

        setDaytoFilter(day);
        updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, courseDayFilter)
    });

    //day filter delete button
    courseDayFilterContainerEl.addEventListener('click', e => {

        targetEl = e.target;
        if(targetEl.getAttribute('id') === 'course-day-delete-btn'){
            deleteDayFromFilter();
            updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, courseDayFilter);
        }
        
        

    });

    makeTable();

}

//navbar related functions

function expandNavBar(navFunction){
    const navBar = document.querySelector('nav');
    const coverEl = document.querySelector('.cover');

    if(navBar.classList.contains('expanded')){
        collapseNavBar();
        return;
    }

    navBar.classList.add('expanded');
    coverEl.classList.add('visible');



    if(navFunction === 'selected-courses-info'){
        showSelectedCoursesInfo();
    }

}

function collapseNavBar(){
    const navBar = document.querySelector('nav');
    const coverEl = document.querySelector('.cover');
    const navBarFunctions = document.querySelectorAll('.nav-func-container > *');
    navBar.classList.remove('expanded');
    coverEl.classList.remove('visible');

    navBarFunctions.forEach(navFunc => {
        navFunc.classList.remove('visible');
    })

}

function showSelectedCoursesInfo(){
    const selectedCoursesInfoContainerEl = document.querySelector('.nav-func-selected-courses-info');
    const activeTableCells = document.querySelectorAll('.table.active .table-cell');

    selectedCoursesInfoContainerEl.classList.add('visible');

    let courseObjectsInActiveTable = [];

    for(let cell of activeTableCells){
        if(!(cell.classList.contains('occupied-cell'))){
            continue;
        }

        let courseId = parseInt(cell.dataset.courseid);
        let courseObject = getCourseObjectFromId(courseId);

        

        if(courseObjectsInActiveTable.includes(courseObject)){
            continue;
        }

        courseObjectsInActiveTable.push(courseObject);
        

    }

    selectedCoursesInfoContainerEl.innerHTML = '<h3>Selected Courses Information</h3>';
    courseObjectsInActiveTable.forEach(courseObject => {
        selectedCoursesInfoContainerEl.insertAdjacentHTML(`beforeend`, `
            
            <div class="course-info-card">
            <p><b>Course Code:</b> ${courseObject.courseCode}</p>
            <p><b>Prerequisite Course:</b> ${courseObject.preRequisiteCourses}</p>
            <p><b>Faculty:</b> ${courseObject.empName} - ${courseObject.empShortName}</p>
            <p><b>Section:</b> ${courseObject.courseDetails}</p>
            <p><b>Exam Day:</b> ${courseObject.dayNo}</p>
            <p><b>Seat Available:</b> ${courseObject.availableSeat}</p>
            <p><b>Seat Filled:</b> ${courseObject.totalFillupSeat}</p>
            <p><b>Seat remaining:</b> ${parseInt(courseObject.availableSeat) - parseInt(courseObject.totalFillupSeat)}</p>


            </div>

            `)
    })

}

//table related functions

function makeTable(){
    const tableContainerEl = document.querySelector('.table-container');
    let tableId = tablesMade + 1;
    tablesMade += 1;
    tableContainerEl.insertAdjacentHTML('beforeend', `
            <div data-tableid="${tableId}" class="table">
                <!-- row 1-->
                <div class="table-cell">Time/Day</div>
                <div class="table-cell">Sunday</div>
                <div class="table-cell">Monday</div>
                <div class="table-cell">Tuesday</div>
                <div class="table-cell">Wednesday</div>
                <div class="table-cell">Thursday</div>
                <div class="table-cell">Friday</div>
                <div class="table-cell">Saturday</div>
    
                <!-- row 08:00 AM-->
                <div class="table-cell">8:00 AM</div>
                <div data-row="08:00 AM" data-col="sunday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="monday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="tuesday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="wednesday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="thursday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="friday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 09:30 AM-->
                <div class="table-cell">9:30 AM</div>
                <div data-row="09:30 AM" data-col="sunday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="monday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="tuesday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="wednesday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="thursday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="friday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 11:00 AM-->
                <div class="table-cell">11:00 AM</div>
                <div data-row="11:00 AM" data-col="sunday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="monday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="tuesday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="wednesday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="thursday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="friday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 12:30 PM-->
                <div class="table-cell">12:30 PM</div>
                <div data-row="12:30 PM" data-col="sunday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="monday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="tuesday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="wednesday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="thursday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="friday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 02:00 PM-->
                <div class="table-cell">2:00 PM</div>
                <div data-row="02:00 PM" data-col="sunday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="monday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="tuesday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="wednesday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="thursday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="friday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 03:30 PM-->
                <div class="table-cell">3:30 PM</div>
                <div data-row="03:30 PM" data-col="sunday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="monday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="tuesday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="wednesday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="thursday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="friday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 05:00 PM-->
                <div class="table-cell">5:00 PM</div>
                <div data-row="05:00 PM" data-col="sunday" class="table-cell"></div>
                <div data-row="05:00 PM" data-col="monday" class="table-cell"></div>
                <div data-row="05:00 PM" data-col="tuesday" class="table-cell"></div>
                <div data-row="05:00 PM" data-col="wednesday" class="table-cell"></div>
                <div data-row="05:00 PM" data-col="thursday" class="table-cell"></div>
                <div data-row="05:00 PM" data-col="friday" class="table-cell"></div>
                <div data-row="05:00 PM" data-col="saturday" class="table-cell"></div>
            </div>
        `);

    const tableMade = document.querySelector(`[data-tableid = "${tableId}"]`);

    tableIds.push(tableId);


    //deleting a course from the table, if it's populated
    //or, adding time/day fliter if the cell is empty
    tableMade.addEventListener('click', e => {
        targetEl = e.target;
        if (targetEl.dataset.row === undefined){
            return;
        }

        //if the cell is empty so we adding the corresponding time/day filter
        if (targetEl.innerText === ''){
            setTimeToFilter(targetEl.dataset.row);
            setDaytoFilter(targetEl.dataset.col);
            updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, courseDayFilter);
        }
        
        //if the cell is already populated, delete that course from the table
        else{ 
            courseId = parseInt(targetEl.dataset.courseid);
            deleteFromActiveTable(getCourseObjectFromId(courseId));
        }

        
        
    });

    //table cell style related function
    //!!!COULD USE A LOT OF PROCESSING POWER AND CAUSE SLOW DOWN
    tableMade.addEventListener('mousemove', e => {
        let x = e.clientX;
        let y = e.clientY;

        let allCells = document.querySelectorAll(`[data-tableid = "${tableId}"] .table-cell`);
        allCells.forEach(cell => {
            cell.classList.remove('delete-prompt');
        })


        //when hovering over a occupied cell, all cell occupied by that course will be red glown.
        el = document.elementFromPoint(x,y);
        if ((!(el.innerText === '')) && (!(el.dataset.courseid === undefined))){
            allCells.forEach(cell => {
                if (cell.dataset.courseid === el.dataset.courseid){
                    cell.classList.add('delete-prompt');
                    
                }
            })
        }else{
            let allCells = document.querySelectorAll('.table-cell');
            allCells.forEach(cell => {
                cell.classList.remove('delete-prompt');
            })
        }
    });

    showTable(`${tableId}`);

    
}

function deleteActiveTable(){

    if (tableIds.length === 1){
        return;
    }

    const activeTableEl = document.querySelector('.table.active');
    const activeTableId = parseInt(activeTableEl.dataset.tableid);

    const activeTableIdIndex = tableIds.indexOf(activeTableId);
    let newActiveTableIdIndex = activeTableIdIndex;

    console.log(activeTableIdIndex);

    tableIds.splice(tableIds.indexOf(activeTableId),1);

    if(newActiveTableIdIndex >= tableIds.length){
        newActiveTableIdIndex = tableIds.length - 1;
    }

    console.log(newActiveTableIdIndex);

    activeTableEl.remove();
    showTable(tableIds[newActiveTableIdIndex]);
}

function showTable(tableId){
    const allTables = document.querySelectorAll('.table');
    const currentTable = document.querySelector(`[data-tableid="${tableId}"`);
    const tableTitle = document.querySelector('.table-header h3');
    allTables.forEach(table => {
        table.classList.remove('active');
    });
    currentTable.classList.add('active');

    tableTitle.innerText = `Table: ${tableId}`;

    

}

function pushToActiveTable(courseObject){
    //This is one unoptimized function ig 💀


    const tableCells = document.querySelectorAll('.table.active .table-cell');
    let time = getTime(courseObject);
    let days = getDays(courseObject);
    let labDay = getLabDay(courseObject);
    let labTimes = getLabTimes(courseObject);

    let courseDetails = courseObject.courseDetails;
    let courseFaculty = getFacultyName(courseObject)[0];

    //checking if the course is already added
    for(let cell of tableCells){
        if(cell.innerText === '' || cell.dataset.row === undefined || cell.dataset.col === undefined){
            continue;
        }
        let occupiedCellCourseId = parseInt(cell.dataset.courseid);
        let occupiedCellCourseObject = getCourseObjectFromId(occupiedCellCourseId);

        if(occupiedCellCourseObject.courseCode === courseObject.courseCode){
            showConflictPrompt('course', occupiedCellCourseObject, courseObject);
            return;
        }


        
    }

    //checking for time conflicts for regular class
    for(let day of days){
        for(let cell of tableCells){
            if (cell.dataset.row === time && cell.dataset.col === day && !(cell.innerText === '')){
                let occupiedCellCourseId = parseInt(cell.dataset.courseid);
                let occupiedCellCourseObject = getCourseObjectFromId(occupiedCellCourseId);

                showConflictPrompt('time',occupiedCellCourseObject, courseObject);
                return;
            }
        }
    }

    //checking for time conflicts for lab class
    if(!(labTimes === null)){
        
        for(let labTime of labTimes){
            for(let cell of tableCells){
                if (cell.dataset.row === labTime && cell.dataset.col === labDay && !(cell.innerText === '')){
                    let occupiedCellCourseId = parseInt(cell.dataset.courseid);
                    let occupiedCellCourseObject = getCourseObjectFromId(occupiedCellCourseId);

                    showConflictPrompt('time',occupiedCellCourseObject, courseObject);
                    return;
                }
            }
        }
    }

    //pushing regular class into cell
    days.forEach(day => {
        tableCells.forEach(cell => {
            if(cell.dataset.row === time && cell.dataset.col === day){
                cell.innerText = courseDetails + '-' + courseFaculty;
                cell.dataset.courseid = courseObject.id;

                cell.classList.add('occupied-cell');
            }
        });

    });

    if((labTimes === null)){
        return;
    }
    //pushing lab into cell
    labTimes.forEach(time => {
        tableCells.forEach(cell => {
            if(cell.dataset.row === time && cell.dataset.col === labDay){
                cell.innerText = courseDetails  + '(LAB)';
                cell.dataset.courseid = courseObject.id;

                cell.classList.add('occupied-cell');
            }
        });
    });

}

function deleteFromActiveTable(courseObject){
    const tableCells = document.querySelectorAll(".table.active .table-cell");
    tableCells.forEach(cell => {
        courseId = parseInt(cell.dataset.courseid)
        if (courseId === courseObject.id){
            cell.innerText = '';
            cell.dataset.courseid = '';

            cell.classList.remove('occupied-cell');
        }
    })
}

function clearActiveTable(){
    const tableCells = document.querySelectorAll(".table.active .table-cell");
    tableCells.forEach(cell => {

        if(!(cell.dataset.row === undefined)){
            cell.innerText = '';
            cell.dataset.courseid = '';

            cell.classList.remove('occupied-cell');
        }

        
        
    })
}

function showComparisonTable(){
    const comparisonTableContainer = document.querySelector('.comparison-table-container');
    if(comparisonTableContainer.classList.contains('visible')){
        hideComparisonTable();
        return;
    }

    const activeTableEl = document.querySelector('.table.active');
    const comparisonTableEl = activeTableEl.cloneNode(true);
    const comparisonTableHeaderEl = document.querySelector('.comparison-table-header h3');
    const courseSelectorEl = document.querySelector('.course-selector');
    const hideComparisonTableBtnEl = document.querySelector('.hide-comparison-table-btn');

    courseSelectorEl.classList.remove('visible');
    comparisonTableEl.classList.remove('active');
    comparisonTableEl.classList.add('comparison');
    comparisonTableContainer.classList.add('visible');
    comparisonTableHeaderEl.innerText = `Table: ${comparisonTableEl.dataset.tableid}`;
    comparisonTableEl.dataset.tableid = 'comparison-table';
    comparisonTableContainer.appendChild(comparisonTableEl);

    hideComparisonTableBtnEl.addEventListener('click', e =>{
        hideComparisonTable();
    })

}

function hideComparisonTable(){
    const comparisonTableContainer = document.querySelector('.comparison-table-container');
    const courseSelectorEl = document.querySelector('.course-selector');

    comparisonTableContainer.innerHTML = `<div class="comparison-table-header">
                <h3></h3>
                <button class="hide-comparison-table-btn"><i class="fa-solid fa-x"></i></button>
            </div>`;
    comparisonTableContainer.classList.remove('visible');
    courseSelectorEl.classList.add('visible');
}

function showConflictPrompt(confilctType, occupiedCourseObject, newCourseObject){
    let promptText = ''
    if(confilctType === 'time'){
        promptText = `There's a conflict between the timing of the selected course!\n
        occupied course: ${occupiedCourseObject.courseDetails}\n
        selected course: ${newCourseObject.courseDetails}\n
        Do you want to replace?`;
    }
    else{
        promptText = `You already added the selected course!\n
        occupied course: ${occupiedCourseObject.courseDetails}\n
        selected course: ${newCourseObject.courseDetails}\n
        Do you want to replace?`;
    }
    

    if (confirm(promptText) === true){
        deleteFromActiveTable(occupiedCourseObject);
        pushToActiveTable(newCourseObject);
    }
}

function downloadActiveTableImage(){

    const activeTableEl = document.querySelector('.table.active');

    html2canvas(activeTableEl).then((canvas) => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Table_${activeTableEl.dataset.tableid}.png`;
        link.href = image;
        link.click();
    });
}

//end


function updateCourseSelector(coursesData, courseCodeFilterArray, courseTimeFilter, CourseDayFilter){
    //console.log('.....')
    //console.log(courseCodeFilterArray);
    //console.log(courseTimeFilter);
    //console.log(courseDayFilter);

    const courseListEl = document.querySelector('.course-list');

    courseListEl.innerHTML = '';
    coursesData.forEach(courseData => {
        courseCode = courseData.courseCode.toUpperCase();
        if(courseCodeFilterArray.includes(courseCode)){

            let seatLeft = parseInt(courseData.availableSeat) - parseInt(courseData.totalFillupSeat);
            let days_str = getDays(courseData)[0] + ' - ' + getDays(courseData)[1];

            let lab_day_str = getLabDay(courseData);
            let lab_times_array = getLabTimes(courseData);
            let lab_str = lab_day_str + '(';
            if (lab_day_str === null){
                lab_str = 'no lab';
            }else{
                lab_times_array.forEach(time => {
                    lab_str = lab_str +  time +  ', ';
                });

                lab_str = lab_str.slice(0, lab_str.length - 2);
                lab_str = lab_str + ')';
                
            }
            

            courseListEl.insertAdjacentHTML('beforeend', 
                `
                <div class="course-list-item-container" data-courseid = "${courseData.id}">
                    <p id="details" ><b>${courseData.courseDetails}</b> // (${days_str}) // ${getTime(courseData)} // <b>Seat Left: ${seatLeft}</b></p>
                    <p id="lab-time-day"><b>Lab</b>: ${lab_str}</p>
                    <p><b>Exam Day:</b> ${courseData.dayNo}</p>
                    <p> ${getFacultyName(courseData)[0]} (${getFacultyName(courseData)[1]})</p>
                    
                    
                </div>
                
                `
                );

                

        }
    });

    //filtering out from the course items according to the filters
    if(!(courseTimeFilter === '')){
        const renderedCourseItems = document.querySelectorAll('.course-list-item-container');
        renderedCourseItems.forEach(item => {
            correspondingId = parseInt(item.dataset.courseid);
            correspondingCourseObject = getCourseObjectFromId(correspondingId);
            if (! (getTime(correspondingCourseObject) === courseTimeFilter)){
                item.remove();
            }
    });

    }

    if(!(courseDayFilter === '')){
        const renderedCourseItems = document.querySelectorAll('.course-list-item-container');
        renderedCourseItems.forEach(item => {
            correspondingId = parseInt(item.dataset.courseid);
            correspondingCourseObject = getCourseObjectFromId(correspondingId);
            if (! (getDays(correspondingCourseObject).includes(CourseDayFilter))){
                item.remove();
            }
    });

    }
    



}

//filter related functions

function addCourseCodetoFilter(courseCode){
    const courseCodeInputEl = document.getElementById('course-code-input');
    const courseCodeItemsContainerEl = document.querySelector('.course-code-items-container');

    if (courseCode === ''){
        return;
    }

    if (courseCodeFilterArray.includes(courseCode)){
        courseCodeInputEl.value = '';
        return;
    }

    courseCodeFilterArray.push(courseCode);
    courseCodeItemsContainerEl.insertAdjacentHTML('beforeend',
         `<p class="course-code-item">${courseCode}<button id="course-code-item-delete-btn"><i class="fa-solid fa-xmark"></i></button></p>`);
    courseCodeInputEl.value = '';
}

function deleteCourseCodeFromFilter(courseCode){
    const courseCodeItemEls = document.querySelectorAll('.course-code-item');
    courseCodeItemEls.forEach(el => {
        elTextValue = el.firstChild.nodeValue;
        if(elTextValue === courseCode){
            el.remove();            
        }
    })

    let itemIndex = courseCodeFilterArray.indexOf(courseCode);
    courseCodeFilterArray.splice(itemIndex,1);
}

function setTimeToFilter(time){
    const courseTimeItemContainerEl = document.querySelector('.course-time-item-container');
    const courseTimeFilterSelectEl = document.getElementById('course-time-select');

    courseTimeFilterSelectEl.value = time;
    courseTimeItemContainerEl.innerHTML = '';
    courseTimeItemContainerEl.insertAdjacentHTML('beforeend', `<p>${time}<button id="course-time-delete-btn">delete</button></p>`);
    courseTimeFilter = time;

    

}

function deleteTimeFromFilter(){
    const courseTimeItemContainerEl = document.querySelector('.course-time-item-container');
    const courseTimeFilterSelectEl = document.getElementById('course-time-select');

    courseTimeItemContainerEl.innerHTML = '';
    courseTimeFilterSelectEl.value = 'none';
    courseTimeFilter = '';
}

function setDaytoFilter(day){
    const courseDayItemContainerEl = document.querySelector('.course-day-item-container');
    const courseDayFilterSelectEl = document.getElementById('course-day-select');

    courseDayFilterSelectEl.value = day;
    courseDayItemContainerEl.innerHTML = '';
    courseDayItemContainerEl.insertAdjacentHTML('beforeend', `<p>${day}<button id="course-day-delete-btn">delete</button></p>`);
    courseDayFilter = day;
    
}

function deleteDayFromFilter(){
    const courseDayItemContainerEl = document.querySelector('.course-day-item-container');
    const courseDayFilterSelectEl = document.getElementById('course-day-select');

    courseDayFilterSelectEl.value = 'none';
    courseDayItemContainerEl.innerHTML = '';
    courseDayFilter = '';
}

//end

//courseObject related helper functions

function getDays(courseObject){
    str = courseObject.classSchedule;
    resultArray = [];
    first_day = '';
    second_day = '';
    
    second_day_starting_index = str.indexOf(',') + 1;

    for(let i = 0; i < str.length; i = i + 1){
        if (str[i] === '('){
            break;
        }
        first_day += str[i].toLowerCase();
    }

    for (let i = second_day_starting_index; str.length; i = i + 1){
        if (str[i] === '('){
            break;
        }

       second_day += str[i].toLowerCase();


    }
    return [first_day, second_day];
}

function getTime(courseObject){
    str = courseObject.classSchedule;
    time_slot_starting_index = str.indexOf('(') + 1;
    time_slot = '';

    for(let i = time_slot_starting_index; i<str.length; i = i + 1){
        if (str[i] === '-'){
            break;
        }

        time_slot += str[i];
    }

    return time_slot;
}

function getCourseObjectFromId(id){
    let res = null;
    for(let i = 0; i < coursesData.length; i = i + 1){
        if (coursesData[i].id === id){
            res = coursesData[i];
            break;
        }
    }
    
    return res;
}

function getFacultyName(courseObject){
    short_name = courseObject.empShortName;
    full_name = courseObject.empName;

    return [short_name, full_name];
}

function getLabTimes(courseObject){

    //I can't explain how this function works 💀
    //can't tell why my naming convention changed either

    if (courseObject.classSchedule === courseObject.classLabSchedule){
        return null;
    }

    regular_class_array = []
    regular_class_str = courseObject.classSchedule + ',';

    lab_class_str = courseObject.classLabSchedule + ',';
    lab_class_array = []

    let a = '';
    for (let i=0; i < regular_class_str.length; i = i + 1){
        if (regular_class_str[i] === ','){
            regular_class_array.push(a);
            a = ''
            continue;
        }
        a += regular_class_str[i];

    }


    let b = '';
    for(let i = 0; i < lab_class_str.length; i = i + 1){
        if(lab_class_str[i] === ','){
            lab_class_array.push(b);
            b = '';
            continue;
        }
        b += lab_class_str[i];
    }
    

    regular_class_array.forEach(item => {
        if (lab_class_array.includes(item)){

            item_index_at_lab_array = lab_class_array.indexOf(item);

            lab_class_array.splice(item_index_at_lab_array,1);
        }
    })


    resArray = []

    lab_class_array.forEach(item => {
        starting_index = item.indexOf('(') + 1;
        c = ''
        for(let i=starting_index; i<item.length; i = i + 1){
            if (item[i] === '-'){
                resArray.push(c);
                break;
            }
            c += item[i];
        }
    })

    return resArray;
}

function getLabDay(courseObject){
    if (courseObject.classSchedule === courseObject.classLabSchedule){
        return null;
    }

    regular_class_array = []
    regular_class_str = courseObject.classSchedule + ',';

    lab_class_str = courseObject.classLabSchedule + ',';
    lab_class_array = []

    let a = '';
    for (let i=0; i < regular_class_str.length; i = i + 1){
        if (regular_class_str[i] === ','){
            regular_class_array.push(a);
            a = ''
            continue;
        }
        a += regular_class_str[i];

    }



    let b = '';
    for(let i = 0; i < lab_class_str.length; i = i + 1){
        if(lab_class_str[i] === ','){
            lab_class_array.push(b);
            b = '';
            continue;
        }
        b += lab_class_str[i];
    }
    


    regular_class_array.forEach(item => {
        if (lab_class_array.includes(item)){

            item_index_at_lab_array = lab_class_array.indexOf(item);

            lab_class_array.splice(item_index_at_lab_array,1);
        }
    })



    res = ''

    for(i=0; i<lab_class_array[0].length; i = i + 1){
        if (lab_class_array[0][i] === '('){
            break;
        }

        res += lab_class_array[0][i];
    }

    res = res.toLowerCase();

    return res;
}

// end
main();
