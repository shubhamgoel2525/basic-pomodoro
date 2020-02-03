document.addEventListener("DOMContentLoaded", function () {
    // this function runs when the DOM is ready, i.e. when the document has been parsed
    const pomodoroTimer = document.querySelector('#timer');

    const startButton = document.querySelector('#start');
    const resetButton = document.querySelector('#reset');

    let isClockRunning = false;

    let timeSpentInCurrentSession = 0;

    let currentTaskLabel = document.querySelector('#clock-task');

    let updatedWorkSessionDuration;
    let updatedBreakSessionDuration;

    const workDurationInput = document.querySelector('#input-work-duration');
    console.log(workDurationInput);
    let breakDurationInput = document.querySelector('#input-break-duration');

    workDurationInput.value = '25';
    breakDurationInput.value = '5';

    let isClockStopped = true;

    let type = 'Work';

    // Time constants
    // 25 mins in seconds
    let workSessionDuration = 1500;
    let currentTimeLeftInSession = 1500;
    // 5 mins in seconds
    let breakSessionDuration = 300;

    // Start
    startButton.addEventListener('click', () => {
        toggleClock();
    })

    //Reset
    resetButton.addEventListener('click', () => {
        toggleClock(true);
    })

    // update work time
    workDurationInput.addEventListener('input', () => {
        updatedWorkSessionDuration = minuteToSeconds(workDurationInput.value);
    })

    // update pause time
    breakDurationInput.addEventListener('input', () => {
        updatedBreakSessionDuration = minuteToSeconds(breakDurationInput.value);
    })

    const minuteToSeconds = mins => {
        return mins * 60;
    }

    const setUpdatedTimers = () => {
        if (type === 'Work') {
            currentTimeLeftInSession = updatedWorkSessionDuration
                ? updatedWorkSessionDuration
                : workSessionDuration
            workSessionDuration = currentTimeLeftInSession;
        } else {
            currentTimeLeftInSession = updatedBreakSessionDuration
                ? updatedBreakSessionDuration
                : breakSessionDuration
            breakSessionDuration = currentTimeLeftInSession;
        }
    }

    const toggleClock = (reset) => {
        togglePlayPauseIcon(reset);
        if (reset) {
            // Stop the timer
            stopClock();
        } else {
            console.log(isClockStopped);
            if (isClockStopped) {
                setUpdatedTimers();
                isClockStopped = false;
            }

            if (isClockRunning === true) {
                // pause
                clearInterval(clockTimer);
                // update icon to play one
                // set val of button to start or pause
                isClockRunning = false;
            } else {
                // Start the timer
                clockTimer = setInterval(() => {
                    stepDown();
                    displayCurrentTimeLeftInSession();
                    progressBar.set(calculateSessionProgress());
                }, 1000);
                isClockRunning = true;
            }

            showStopIcon();
        }
    };

    const stepDown = () => {
        if (currentTimeLeftInSession > 0) {
            // decrease time left / increase time spent
            currentTimeLeftInSession--;
            timeSpentInCurrentSession++;
        } else if (currentTimeLeftInSession === 0) {
            timeSpentInCurrentSession = 0;
            // Timer is over -> if work switch to break, viceversa
            if (type === 'Work') {
                currentTimeLeftInSession = breakSessionDuration;
                displaySessionLog('Work');
                type = 'Break';
                currentTaskLabel.value = 'Break';
                currentTaskLabel.disabled = true;
            } else {
                currentTimeLeftInSession = workSessionDuration;
                type = 'Work';
                if (currentTaskLabel.value === 'Break') {
                    currentTaskLabel.value = workSessionLabel;
                }
                currentTaskLabel.disabled = false;
                displaySessionLog('Break');
            }
        }

        displayCurrentTimeLeftInSession();
    }

    const displayCurrentTimeLeftInSession = () => {
        const secondsLeft = currentTimeLeftInSession;
        let result = '';
        const seconds = secondsLeft % 60;
        const minutes = parseInt(secondsLeft / 60) % 60;
        let hours = parseInt(secondsLeft / 3600);
        // add leading zeroes if it's less than 10
        function addLeadingZeroes(time) {
            return time < 10 ? `0${time}` : time
        }
        if (hours > 0) result += `${hours}:`
        result += `${addLeadingZeroes(minutes)}:${addLeadingZeroes(seconds)}`
        progressBar.text.innerText = result.toString();
    }

    const stopClock = () => {
        setUpdatedTimers();
        displaySessionLog(type);
        // 1) reset the timer we set
        clearInterval(clockTimer);
        isClockStopped = true;
        // 2) update our variable to know that the timer is stopped
        isClockRunning = false;
        // reset the time left in the session to its original state
        currentTimeLeftInSession = workSessionDuration;
        // update the timer displayed
        displayCurrentTimeLeftInSession();
        type = 'Work';
        timeSpentInCurrentSession = 0;
    }

    const displaySessionLog = (type) => {
        const sessionsList = document.querySelector('#sessions');
        // append li to list
        const li = document.createElement('li');
        if (type === 'Work') {
            sessionLabel = currentTaskLabel.value
                ? currentTaskLabel.value
                : 'Work'
            workSessionLabel = sessionLabel;
        } else {
            sessionLabel = 'Break';
        }
        let elapsedTime = parseInt(timeSpentInCurrentSession / 60);
        elapsedTime = elapsedTime > 0 ? elapsedTime : '<1';

        const text = document.createTextNode(
            `${sessionLabel} : ${elapsedTime} min`
        )
        li.appendChild(text);
        sessionsList.appendChild(li);
    }

    const togglePlayPauseIcon = (reset) => {
        const playIcon = document.querySelector('#play-icon');
        const pauseIcon = document.querySelector('#pause-icon');
        if (reset) {
            // when resetting -> always revert to play icon
            if (playIcon.classList.contains('hidden')) {
                playIcon.classList.remove('hidden');
            }
            if (!pauseIcon.classList.contains('hidden')) {
                pauseIcon.classList.add('hidden');
            }
        } else {
            playIcon.classList.toggle('hidden');
            pauseIcon.classList.toggle('hidden');
        }
    }

    const showStopIcon = () => {
        const stopButton = document.querySelector('#stop');
        stopButton.classList.remove('hidden');
    }

    const progressBar = new ProgressBar.Circle("#timer", {
        strokeWidth: 2,
        text: {
            value: "25.00"
        },
        trailColor: "#f4f4f4",
    });

    const calculateSessionProgress = () => {
        // calculate the completion rate of this session
        const sessionDuration =
            type === 'Work' ? workSessionDuration : breakSessionDuration
        return (timeSpentInCurrentSession / sessionDuration) * 10;
    }
});