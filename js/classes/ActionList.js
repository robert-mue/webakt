class ActionList {

    constructor() {
        this._actions = [];
    }


    add (action) {
        if (!AKT.state.event_recording) return;
        if (AKT.state.playing_events) return;

        this._actions.push(action);
        
        this.saveActionListToLocalStorage('webakt_actions_latest');

        var actionListSpec = [];
        for (var i=0; i<this._actions.length; i++) {
            var action = this._actions[i];
            actionListSpec.push(action.makeActionSpec());
        }
        localStorage.setItem('webakt_actions_latest',JSON.stringify(actionListSpec));
    }


    open () {
        var id = prompt('Recording_name:','');
        this.play(id);
    }


    save () {
        var id = prompt('Recording name:','');
        localStorage.setItem('webakt_actions_'+id,JSON.stringify(this._actions));
    }


    saveActionListToLocalStorage (key) {
        var actionListSpec = [];
        for (var i=0; i<this._actions.length; i++) {
            var action = this._actions[i];
            actionListSpec.push(action.makeActionSpec());
        }
        localStorage.setItem(key,JSON.stringify(actionListSpec));
    }


    stop () {
        AKT.state.event_recording = false;
    }




    stepThroughRecording (id) {

        if (!AKT.state.startedStepping) {
            AKT.state.event_recording = false;
            AKT.state.playing_events = true;
            if (!id) {
                this._actions = this.getActionListFromLocalStorage('webakt_actions_latest');
            } else {
                this._actions = this.getActionListFromLocalStorage('webakt_actions_'+id);
            }
            AKT.state.stepCounter = 0;
            var firstEventMessage = this._actions[0]._before;
            $('#message').html(firstEventMessage);
            AKT.state.startedStepping = true;
            return;
        }

        AKT.action_list.oneStep(AKT.action_list._actions);
        var iStep = AKT.state.stepCounter;
        if (iStep < this._actions.length) {
            var nextEventMessage = this._actions[iStep]._before;
            $('#message').html(iStep+': '+nextEventMessage);
        }
    }

    play (id) {
        AKT.state.event_recording = false;
        AKT.state.playing_events = true;
        if (!id) {
            this._actions = this.getActionListFromLocalStorage('webakt_actions_latest');
        } else {
            this._actions = this.getActionListFromLocalStorage('webakt_actions_'+id);
        }
        AKT.state.stepCounter = 0;
        AKT.timer = setInterval(this.oneStep,1000,this._actions);
        AKT.state.playingEvents = false;
    }


    oneStep (actions) {
        console.log('\n==== ',actions);
        $('button').css('background','#d0d0d0');
        var istep = AKT.state.stepCounter;
        //alert(actions[istep]._before);
        $('#message').html(actions[istep]._before);
        actions[istep].triggerEvent(actions);
        //alert(actions[istep]._after);
        AKT.state.stepCounter += 1;
        if (AKT.state.stepCounter >= actions.length) {
            clearInterval(AKT.timer);
            AKT.state.stepping_through_recording = false;
        }
    }


    getActionListFromLocalStorage (key) {
        var actionList = [];
        var actionListSpec = JSON.parse(localStorage.getItem(key));
        for (var i=0;i<actionListSpec.length;i++) {
            var action = new Action(actionListSpec[i]);
            actionList.push(action);
        }
        return actionList;
    }

}
