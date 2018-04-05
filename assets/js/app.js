//================UI CONTROLLER==================
const UICtrl = (function(){
    
    const UISelectors = {
        //Buttons
        answerSubmit: '.answerSubmit',
        nextQuestion: '.nextQuestion',
        //Inputs
        
        //Selects
        triviaCategory: '#triviaCategory',
        
        //Checkboxes
        answerChoices: '.answerChoices',
        
        //Other
        questionBox: '.questionBox',
        numCorrect: '.numCorrect',
        numIncorrect: '.numIncorrect',
        keepScore: '.keepScore'

    }
    let questionCount = 0;
    //Public Methods
    return {
        displayQA(questions){
            document.querySelector(UISelectors.keepScore).style.display = 'block';
            questionCount ++;
            let divBoxes = Array.from(document.querySelectorAll('.option'));
            //looop over questions array
            questions.forEach((question, index, arr)=>{
                
                if(arr[index] === questions[questionCount]){
                    //splice the correct answer randomly back into the answers array to have a complete array of all four options including the correct
                   let randomNum = Math.round(Math.random()*4);
                    question.incorrect_answers.splice(randomNum, 0, question.correct_answer);
                    let answers = question.incorrect_answers,
                        correctAnswerIndex = answers.indexOf(question.correct_answer);
                    //loop over the divBoxes and set the innerHTML to the following. Also set a data attribute which will later be used to check the correct answer
                    divBoxes.forEach((box, index, arr)=>{
                        if(divBoxes[index]===arr[0]){
                            divBoxes[index].innerHTML = `<h1>Trivia Question:</h1><div class="ml-3" data-id='${correctAnswerIndex}'> ${question.question}</div>`;
                        } else {
                            box.innerHTML = `<div class="input-group-text">
                                                <label for="choice-${index-1}" class="form__radio-label mb-0">
                                                <input type="radio" class='answerChoices' name='answerChoices' id='choice-${index-1}'>
                                                    <span class="form__radio-button"></span>
                                                    ${answers[index-1]}
                                                </label>
                                            </div>`; 
                            
                        }
                    });
                }              
            });

        },
        
        submitState:()=>{
            document.querySelector(UISelectors.nextQuestion).style.display = 'none';
            document.querySelector(UISelectors.answerSubmit).style.display = 'block';
        },
        nextState:()=>{
            document.querySelector(UISelectors.nextQuestion).style.display = 'block';
            document.querySelector(UISelectors.answerSubmit).style.display = 'none';
        },
        getSelectors: () => {
            return UISelectors;
        }
    }

})();


//==============APP CONTROLLER=================
const AppCtrl = (function(UICtrl){
    
    let timeObj = {
        timerRunning: false,
        startTime: 30000,
        resetTime: ()=>{
            this.startTime = 30000;
        }
    }
    
    let intervalId;
    
    //Get UI selectors
    const UISelectors = UICtrl.getSelectors();
    
    const loadEventListeners = ()=>{
        /*----------------INPUT Events-----------------*/
        
        /*----------------CLICK Events-----------------*/
        //Get User Input event
        document.querySelector(UISelectors.answerSubmit).addEventListener('click', getUserInput);
        
        //Next question click -get new question
        document.querySelector(UISelectors.nextQuestion).addEventListener('click', retrieveQuestions);
        
        /*----------------CHANGE Events-----------------*/
        //On category select change - get first question
        document.querySelector(UISelectors.triviaCategory).addEventListener('change', retrieveQuestions);
        
        //Loop over array of option class and traverse down to the radio button and set its value to clicked
        Array.from(document.querySelectorAll('.option')).forEach(option=>{
            option.addEventListener('click', (e)=>{
                e.target.firstElementChild.firstElementChild.checked = true
            })    
        });
    }
    const retrieveQuestions = function(){
        
        document.querySelector('.startTriviaBox').style.display = 'none';
        
        UICtrl.submitState();
        
        const selectedTriviaCat = document.querySelector(UISelectors.triviaCategory);

        const selectedValue = selectedTriviaCat.options[selectedTriviaCat.selectedIndex].value;
        //grab user select value from trivia cat select and input into the fetch apo
        fetch(`https://opentdb.com/api.php?amount=20&category=${selectedValue}&type=multiple`)
          .then(function(response) {
            return response.json();
          })
          .then(function(questions) {
            //Pass the response data questions to the displayQA function
            UICtrl.displayQA(questions.results);
            //Start the timer
            timer();
          });
        
    }
    let numCorrect = [],
            numIncorrect = [];
    const getUserInput = function(){
        timeObj.timerRunning = false;
            clearInterval(intervalId);
            timeObj.startTime = 30000;
            document.querySelector('.timer').style.color = 'white';
        
        let answerChoices = Array.from(document.querySelectorAll(UISelectors.answerChoices));
        
        answerChoices.forEach(choice=>{
            if(choice.checked){
                let selectedAnswer = parseInt(choice.id.split('-')[1]),
                    correctAnswer = parseInt(document.querySelector(UISelectors.questionBox).lastElementChild.getAttribute('data-id'));
                if(selectedAnswer === correctAnswer){
                    answerChoices[correctAnswer].parentElement.parentElement.style.backgroundColor = 'green';
                    numCorrect.push(answerChoices[correctAnswer]);
                    document.querySelector(UISelectors.numCorrect).innerHTML = `${numCorrect.length}`;
                    UICtrl.nextState();
                }else{
                    numIncorrect.push(answerChoices[selectedAnswer])
                    answerChoices[correctAnswer].parentElement.parentElement.style.backgroundColor = 'green';
                    answerChoices[selectedAnswer].parentElement.parentElement.style.backgroundColor = 'red';
                    document.querySelector(UISelectors.numIncorrect).innerHTML = `${numIncorrect.length}`;
                    UICtrl.nextState();
                }
            }       
        });
    }
    
    const timer = function(){
          
        if(!timeObj.timerRunning){
                intervalId = setInterval(timeCounter,1000);
                timeObj.timerRunning = true;
          } 
            
        }
    
    const timeCounter = function(){
        
            let convertedTime = (timeObj.startTime-=1000)/1000;
                switch(true) {
                    case (convertedTime === 0):
                        document.querySelector('.timer').innerHTML = `00:0${convertedTime}`;
                        timeObj.timerRunning = false;
                        clearInterval(intervalId);
                        timeObj.startTime = 30000;
                        document.querySelector('.timer').style.color = 'white';
                        numIncorrect.push('0');
                        document.querySelector(UISelectors.numIncorrect).innerHTML = `${numIncorrect.length}`;
                        retrieveQuestions();
                        break;
                    case (convertedTime <= 5):
                        document.querySelector('.timer').style.color = 'red';
                        document.querySelector('.timer').innerHTML = `00:0${convertedTime}`;
                        break;
                    case (convertedTime <= 9):
                        document.querySelector('.timer').style.color = 'yellow';
                        document.querySelector('.timer').innerHTML = `00:0${convertedTime}`;
                        break;   
                    
                    
                    default:
                        document.querySelector('.timer').innerHTML = `00:${convertedTime}`;
                }
                 
        }
    

    //Public Methods
    return {
        init: () => {
            loadEventListeners();
            document.querySelector(UISelectors.keepScore).style.display = 'none';
            
            
//            document.querySelector('.card-body').innerHTML = `<h1 class="display-3 text-center selectCat">Select a Trivia Category!</h1>`;
            
        }
    }

})(UICtrl);

AppCtrl.init();

 
