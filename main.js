//God forgive me for I have written the most dogshit and unreadable code in the history of humankind 💀💀
//Made by Sabbir Shimanto, Brac University(ID: 23201086)


//gotta refactor this code :""""(


async function fetchJsonData(){
    const response = await fetch('https://usis-cdn.eniamza.com/connect.json');
    //const response = await fetch('usisdump.json');
    const data = await response.json();

    

    // sort the data according to sections
    //This following bit was ripped off from preprereg git repo 💀
    data.sort(function(a, b) {
        return `${a["courseCode"]} - ${a["sectionName"]}`.localeCompare(`${b["courseCode"]} - ${b["sectionName"]}`);
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

    const mobile_courseListCcontainerButtonEl = document.querySelector('.mobile-course-list-container-btn');
    const mobile_TableContainerButton = document.querySelector('.mobile-table-container-btn');
    const mobile_selectedCourseInfoButtonEl = document.querySelector('.mobile-selected-course-info-btn');



    coursesData = await fetchJsonData();




    //mobile navbar event callback functions

    mobile_courseListCcontainerButtonEl.addEventListener('click', e => {mobile_showCourseSelectorContainer()});
    mobile_TableContainerButton.addEventListener('click', e => {mobile_showTableContainer()});
    mobile_selectedCourseInfoButtonEl.addEventListener('click', e=> {expandNavBar('selected-courses-info')});


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

//mobile navbar functions
function mobile_showTableContainer(){
    const tableContainerEl = document.querySelector('.table-container');
    const courseSelectorContainerEl = document.querySelector('.course-selector');

    tableContainerEl.classList.remove('mobile-hide');
    courseSelectorContainerEl.classList.add('mobile-hide');
    collapseNavBar();
}

function mobile_showCourseSelectorContainer(){
    const tableContainerEl = document.querySelector('.table-container');
    const courseSelectorContainerEl = document.querySelector('.course-selector');

    tableContainerEl.classList.add('mobile-hide');
    courseSelectorContainerEl.classList.remove('mobile-hide');
    collapseNavBar();
}



//navbar related functions

function expandNavBar(navFunction){
    const navBar = document.querySelector('nav');
    const coverEl = document.querySelector('.cover');

    //if(navBar.classList.contains('expanded')){
    //    collapseNavBar();
    //    return;
    //}

    navBar.classList.add('expanded');
    coverEl.classList.add('visible');



    if(navFunction === 'selected-courses-info'){
        showSelectedCoursesInfo();
    }
    else if(navFunction == 'credits'){
        showCredits();
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

function showCredits(){

    const creditsInfoContainerEl = document.querySelector('.nav-func-credits');

    if (creditsInfoContainerEl.classList.contains('visible')){
        collapseNavBar();
        return;
    }

    const navBarFunctions = document.querySelectorAll('.nav-func-container > *');
    navBarFunctions.forEach(navFunc => {
        navFunc.classList.remove('visible');
    });

    
    creditsInfoContainerEl.classList.add('visible');

}

function showSelectedCoursesInfo(){

    const selectedCoursesInfoContainerEl = document.querySelector('.nav-func-selected-courses-info');

    if (selectedCoursesInfoContainerEl.classList.contains('visible')){
        collapseNavBar();
        return;
    }

    const navBarFunctions = document.querySelectorAll('.nav-func-container > *');
    navBarFunctions.forEach(navFunc => {
        navFunc.classList.remove('visible');
    });


    
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

        let timeSlots = getTimeSlots(courseObject);
        let labTimeSlots = getLabTimeSlots(courseObject);

        let lab_str = 'no lab';
            if (labTimeSlots != null){
                let lab_day_str = labTimeSlots[0].day;

                let lab_time_str = '';
                for(let timeObject of labTimeSlots){
                    lab_time_str = lab_time_str + timeObject.time + ', '
                }
                lab_time_str = lab_time_str.slice(0, lab_time_str.length - 2);

                lab_str = `${lab_day_str} (${lab_time_str})`;
            }
            
        let days_str = '';

        if(timeSlots[0].day == timeSlots[1].day){
            days_str = timeSlots[0].day;
        }
        else{
            days_str = `(${timeSlots[0].day} - ${timeSlots[1].day})`;
        }

        let time_str = '';

        if(timeSlots[0].time == timeSlots[1].time){
            time_str = timeSlots[0].time;
        }
        else{
            time_str = `(${timeSlots[0].time},${timeSlots[1].time})`;
        }



        selectedCoursesInfoContainerEl.insertAdjacentHTML(`beforeend`, `
            
            <div class="course-info-card">
            <p><b>Course Code:</b> ${getCourseCode(courseObject)}</p>
            <p><b>Faculty:</b> ${getFacultyName(courseObject)}</p>
            <p><b>Section:</b> ${getSection(courseObject)}</p>
            <p><b>Time:</b> ${time_str}</p>
            <p><b>Days:</b> ${days_str}</p>
            <p><b>Lab:</b> ${lab_str}</p>
            <p><b>Exam Day:</b> ${getFinalExamDetail(courseObject)}</p>
            <p><b>Seat Available:</b> ${getAvailableSeat(courseObject)}</p>


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
                <div class="table-cell"><span class='lg-view'>Time/Day</span><span class='sm-view'>T/D</span></div>
                <div class="table-cell"><span class='lg-view'>Sunday</span><span class='sm-view'>S</span></div>
                <div class="table-cell"><span class='lg-view'>Monday</span><span class='sm-view'>M</span></div>
                <div class="table-cell"><span class='lg-view'>Tuesday</span><span class='sm-view'>T</span></div>
                <div class="table-cell"><span class='lg-view'>Wednesday</span><span class='sm-view'>W</span></div>
                <div class="table-cell"><span class='lg-view'>Thursday</span><span class='sm-view'>Th</span></div>
                <div class="table-cell"><span class='lg-view'>Friday</span><span class='sm-view'>F</span></div>
                <div class="table-cell"><span class='lg-view'>Saturday</span><span class='sm-view'>Sa</span></div>
    
                <!-- row 08:00 AM-->
                <div class="table-cell"><span class='lg-view'>08:00 AM</span><span class='sm-view'>8AM</span></div>
                <div data-row="08:00 AM" data-col="sunday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="monday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="tuesday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="wednesday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="thursday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="friday" class="table-cell"></div>
                <div data-row="08:00 AM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 09:30 AM-->
                <div class="table-cell"><span class='lg-view'>09:30 AM</span><span class='sm-view'>9.30</span></div>
                <div data-row="09:30 AM" data-col="sunday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="monday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="tuesday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="wednesday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="thursday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="friday" class="table-cell"></div>
                <div data-row="09:30 AM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 11:00 AM-->
                <div class="table-cell"><span class='lg-view'>11.00 AM</span><span class='sm-view'>11AM</span></div>
                <div data-row="11:00 AM" data-col="sunday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="monday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="tuesday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="wednesday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="thursday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="friday" class="table-cell"></div>
                <div data-row="11:00 AM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 12:30 PM-->
                <div class="table-cell"><span class='lg-view'>12:30 PM</span><span class='sm-view'>12.30</span></div>
                <div data-row="12:30 PM" data-col="sunday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="monday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="tuesday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="wednesday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="thursday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="friday" class="table-cell"></div>
                <div data-row="12:30 PM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 02:00 PM-->
                <div class="table-cell"><span class='lg-view'>02:00 PM</span><span class='sm-view'>2PM</span></div>
                <div data-row="02:00 PM" data-col="sunday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="monday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="tuesday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="wednesday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="thursday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="friday" class="table-cell"></div>
                <div data-row="02:00 PM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 03:30 PM-->
                <div class="table-cell"><span class='lg-view'>03:30 PM</span><span class='sm-view'>3.30</span></div>
                <div data-row="03:30 PM" data-col="sunday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="monday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="tuesday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="wednesday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="thursday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="friday" class="table-cell"></div>
                <div data-row="03:30 PM" data-col="saturday" class="table-cell"></div>
    
                <!-- row 05:00 PM-->
                <div class="table-cell"><span class='lg-view'>05:00 PM</span><span class='sm-view'>5PM</span></div>
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
    let timeSlots = getTimeSlots(courseObject);
    let labTimeSlots = getLabTimeSlots(courseObject);
    let courseDetails = `${getCourseCode(courseObject)}[${getSection(courseObject)}]`;
    let courseFaculty = getFacultyName(courseObject);

    //checking if the course is already added
    for(let cell of tableCells){
        if(cell.innerText === '' || cell.dataset.row === undefined || cell.dataset.col === undefined){
            continue;
        }
        let occupiedCellCourseId = parseInt(cell.dataset.courseid);
        let occupiedCellCourseObject = getCourseObjectFromId(occupiedCellCourseId);

        if(getCourseCode(occupiedCellCourseObject) === getCourseCode(courseObject)){
            showConflictPrompt('course', occupiedCellCourseObject, courseObject);
            return;
        }


        
    }

    //checking for time conflicts for regular class
    for(let slot of timeSlots){
        for(let cell of tableCells){
            if (cell.dataset.row === slot.time && cell.dataset.col === slot.day && !(cell.innerText === '')){
                let occupiedCellCourseId = parseInt(cell.dataset.courseid);
                let occupiedCellCourseObject = getCourseObjectFromId(occupiedCellCourseId);

                showConflictPrompt('time',occupiedCellCourseObject, courseObject);
                return;
            }
        }
    }

    //checking for time conflicts for lab class
    if(!(labTimeSlots === null)){
        
        for(let slot of labTimeSlots){
            for(let cell of tableCells){
                if (cell.dataset.row === slot.time && cell.dataset.col === slot.day && !(cell.innerText === '')){
                    let occupiedCellCourseId = parseInt(cell.dataset.courseid);
                    let occupiedCellCourseObject = getCourseObjectFromId(occupiedCellCourseId);

                    showConflictPrompt('time',occupiedCellCourseObject, courseObject);
                    return;
                }
            }
        }
    }

    //checking for exam time conflict
    for(let cell of tableCells){
        if(cell.innerText === '' || cell.dataset.row === undefined || cell.dataset.col === undefined){
            continue;
        }
        let occupiedCellCourseId = parseInt(cell.dataset.courseid);
        let occupiedCellCourseObject = getCourseObjectFromId(occupiedCellCourseId);

        if((getFinalExamDate(occupiedCellCourseObject) === getFinalExamDate(courseObject))
        && (getFinalExamTime(occupiedCellCourseObject) === getFinalExamTime(courseObject))    
        ){
            showConflictPrompt('exam', occupiedCellCourseObject, courseObject);
            return;
        }

        
    }


    //pushing regular class into cell
    timeSlots.forEach(slot => {
        tableCells.forEach(cell => {
            if(cell.dataset.row === slot.time && cell.dataset.col === slot.day){
                cell.innerText = courseDetails + '-' + courseFaculty;
                cell.dataset.courseid = courseObject.sectionId;

                cell.classList.add('occupied-cell');
            }
        });

    });

    //pushing lab into cell
    if (!(labTimeSlots == null)){
        labTimeSlots.forEach(slot => {
            tableCells.forEach(cell => {
                if(cell.dataset.row === slot.time && cell.dataset.col === slot.day){
                    cell.innerText = courseDetails  + '(LAB)';
                    cell.dataset.courseid = courseObject.sectionId;

                    cell.classList.add('occupied-cell');
                }
            });
        });
    }
        

}

function deleteFromActiveTable(courseObject){
    const tableCells = document.querySelectorAll(".table.active .table-cell");
    tableCells.forEach(cell => {
        courseId = parseInt(cell.dataset.courseid)
        if (courseId === courseObject.sectionId){
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
        occupied course: ${getCourseCode(occupiedCourseObject)}[${getSection(occupiedCourseObject)}]\n
        selected course: ${getCourseCode(newCourseObject)}[${getSection(newCourseObject)}]\n
        Do you want to replace?`;
    }

    else if(confilctType == 'exam'){
        promptText = `There's a conflict between the exam time of the selected course!\n
        occupied course: ${getCourseCode(occupiedCourseObject)}[${getSection(occupiedCourseObject)}]\n
        selected course: ${getCourseCode(newCourseObject)}[${getSection(newCourseObject)}]\n
        Do you want to replace?`;
    }

    else{
        promptText = `You already added the selected course!\n
        occupied course: ${getCourseCode(occupiedCourseObject)}[${getSection(occupiedCourseObject)}]\n
        selected course: ${getCourseCode(newCourseObject)}[${getSection(newCourseObject)}]\n
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
    // courseData is courseObject
    coursesData.forEach(courseData => {
        let courseCode = courseData.courseCode.toUpperCase();
        if(courseCodeFilterArray.includes(courseCode)){

            let courseCode = getCourseCode(courseData);
            let courseSection = getSection(courseData);
            let seatLeft = getAvailableSeat(courseData);
            let timeSlots = getTimeSlots(courseData);
            let labTimeSlots = getLabTimeSlots(courseData);
            let finalExamDetail = getFinalExamDetail(courseData);
            let facultyName = getFacultyName(courseData);

            let lab_str = 'no lab';
            if (labTimeSlots != null){
                let lab_day_str = labTimeSlots[0].day;

                let lab_time_str = '';
                for(let timeObject of labTimeSlots){
                    lab_time_str = lab_time_str + timeObject.time + ', '
                }
                lab_time_str = lab_time_str.slice(0, lab_time_str.length - 2);

                lab_str = `${lab_day_str} (${lab_time_str})`;
            }
            
            let days_str = '';

            if(timeSlots[0].day == timeSlots[1].day){
                days_str = timeSlots[0].day;
            }
            else{
                days_str = `(${timeSlots[0].day} - ${timeSlots[1].day})`;
            }

            let time_str = '';

            if(timeSlots[0].time == timeSlots[1].time){
                time_str = timeSlots[0].time;
            }
            else{
                time_str = `(${timeSlots[0].time},${timeSlots[1].time})`;
            }

            


            

            courseListEl.insertAdjacentHTML('beforeend', 
                `
                <div class="course-list-item-container" data-courseid = "${courseData.sectionId}">
                    <p id="details" ><b>${courseCode}[${courseSection}]</b> // ${days_str} // ${time_str} // <b>Seat Left: ${seatLeft}</b></p>
                    <p id="lab-time-day"><b>Lab</b>: ${lab_str}</p>
                    <p><b>Final Exam:</b> ${finalExamDetail}</p>
                    <p> ${facultyName}</p>
                    
                    
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

            timesArray = [];
            for(let timeObject of getTimeSlots(correspondingCourseObject)){
                timesArray.push(timeObject.time);
            }

            if (! (timesArray.includes(courseTimeFilter))){
                item.remove();
            }
    });

    }

    if(!(courseDayFilter === '')){
        const renderedCourseItems = document.querySelectorAll('.course-list-item-container');
        renderedCourseItems.forEach(item => {
            correspondingId = parseInt(item.dataset.courseid);
            correspondingCourseObject = getCourseObjectFromId(correspondingId);

            daysArray = [];
            for(let timeObject of getTimeSlots(correspondingCourseObject)){
                daysArray.push(timeObject.day);
            }

            if (! (daysArray.includes(CourseDayFilter))){
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
function getCourseCode(courseObject){
    const courseCode = courseObject.courseCode;
    return courseCode;
}

function getSection(courseObject){
    const section = courseObject.sectionName;
    return section;
}

function getFinalExamDetail(courseObject){
    const finalExamDetail = courseObject.sectionSchedule.finalExamDetail;
    return finalExamDetail;
}

function getFinalExamDate(courseObject){
    const finalExamDate = courseObject.sectionSchedule.finalExamDate;
    return finalExamDate;
}

function getFinalExamTime(courseObject){
    const finalExamTime = courseObject.sectionSchedule.finalExamStartTime;
    return finalExamTime;
}

function getAvailableSeat(courseObject){
    const capacity = parseInt(courseObject.capacity);
    const consumedSeat = parseInt(courseObject.consumedSeat);
    const availableSeat = capacity - consumedSeat;

    return availableSeat.toString();
}


function getTimeSlots(courseObject){
    let resArray = [];
    const timeObjects = courseObject.sectionSchedule.classSchedules;
    for(let timeObject of timeObjects){
        let slot = {
            time: get12TimeFrom24Time(timeObject.startTime),
            day: timeObject.day.toLowerCase()
        }
        resArray.push(slot);
    
    }

    return resArray;
}

function getLabTimeSlots(courseObject){
    if (courseObject.labSchedules == null){
        return null;
    }

    let resArray = [];
    const timeObjects = courseObject.labSchedules;
    for(let timeObject of timeObjects){
        let first_slot_start_time = get12TimeFrom24Time(timeObject.startTime);
        let first_slot_ending_time = get12TimeFrom24Time(timeObject.endTime);

        let second_slot_start_time = ''

        if ((first_slot_start_time === '08:00 AM')  &&  (first_slot_ending_time != '09:20 AM')) {
            second_slot_start_time = '09:30 AM';
        }
        else if((first_slot_start_time == '09:30 AM') &&  (first_slot_ending_time != '10:50 AM')){
            second_slot_start_time = '11:00 AM';
        }
        else if((first_slot_start_time == '11:00 AM') &&  (first_slot_ending_time != '12:20 PM')){
            second_slot_start_time = '12:30 PM';
        }
        else if((first_slot_start_time == '12:30 PM') &&  (first_slot_ending_time != '01:50 PM')){
            second_slot_start_time = '02:00 PM';
        }
        else if((first_slot_start_time == '02:00 PM') &&  (first_slot_ending_time != '03:20 PM')){
            second_slot_start_time = '03:30 PM';
        }
        else if((first_slot_start_time == '03:30 PM') &&  (first_slot_ending_time != '04:50 AM')){
            second_slot_start_time = '05:00 PM';
        }

        
        let slot_1 = {
            time: first_slot_start_time,
            day: timeObject.day.toLowerCase()
        }
        resArray.push(slot_1);
        
        if(second_slot_start_time != ''){
            let slot_2 = {
                time: second_slot_start_time,
                day: timeObject.day.toLowerCase()
            }

            resArray.push(slot_2);
        }
        
        return resArray;

    }
}




function getCourseObjectFromId(id){
    let res = null;
    for(let i = 0; i < coursesData.length; i = i + 1){
        if (coursesData[i].sectionId === id){
            res = coursesData[i];
            break;
        }
    }
    
    return res;
}

function getFacultyName(courseObject){
    short_name = courseObject.faculties;

    return short_name;
}




function get12TimeFrom24Time(time_string){

    //converts 15:30:00 into 03:30 PM

    time_slot = '';
    start_time = time_string.slice(0,5);
    start_hour = parseInt(start_time.slice(0,2))
    if (start_hour > 12){
        time_slot = `0${(start_hour - 12).toString()}${start_time.slice(2,5)} PM`;
    }
    else if(start_hour == 12){
        time_slot = `${(start_hour).toString()}${start_time.slice(2,5)} PM`
    }
    else{
        time_slot = `${start_time} AM`
    }

    return time_slot;
    
}


// end
main();
