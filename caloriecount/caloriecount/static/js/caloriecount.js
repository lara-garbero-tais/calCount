$( function() {
userSetup(true)

// AJAX calls
	$('#form-signin').submit(function (e) {
        e.preventDefault();
        serializedString = $(this).serialize();
        var jqxhr = $.post("/ajax_auth/login/",
                    $(this).serialize(),
                    function (data) {
                    	$("#signin-box").hide();
						$("#signin-box-toggler").hide();
                        $("#user-panel-toggler").hide();
                        $('#form-signin')[0].reset();
                        userSetup(true)
                    })
                    .fail(function (err) {
                        $("#login-result").html(err.responseJSON["error_msg"]);
                        $("#login-result").show();
                    });
    });


    $('#form-register').submit(function (e) {
        e.preventDefault();
        $.post("/ajax_auth/register/",
                    $(this).serialize(),
                    function (data) {
                        $("#register-box").hide();
                        $("#register-box-toggler").hide();
                        $('#form-register')[0].reset();
                        userSetup(true);
                    })
                    .fail(function (err) {
                        $("#register-result").html(err.responseJSON["error_msg"]);
                        $("#register-result").show();
                    });
    });


    $("#update-daily-goal").click(function(e) {
        var dailyGoalPost = $.ajax({
            url : "/api/users/"+loggedUser.id+"/",
            data : JSON.stringify({'profile': {'expected_calories': $("#daily-goal-input").val()}}),
            type : 'PATCH',
            contentType : 'application/json',
            processData: false,
            dataType: 'json',
            success: function( data ) {
                loggedUser = data;
                updateDailyGoalPanel();
            },
            error: function(xhr, status, error) {
                console.log(error)
            },
        });
    });


    $('#form-new-intake').submit(function (e) {
        e.preventDefault();
        var parsedDate = new Date($(this).find('input[name="date"]').val());
        var newIntakeData = {
            "user": "http://127.0.0.1:8000/api/users/"+loggedUser.id+"/",
            "date": parsedDate.toISOString(),
            "calories": $(this).find('input[name="calories"]').val(),
            "description": $(this).find('input[name="description"]').val(),
        }
        $.post("/api/calorie-intakes/",
                    newIntakeData,
                    function (data) {
                        insertCalorieIntake(data, '#calorie-intake-list');
                        $('#form-new-intake')[0].reset();
                        userSetup(false);
                    })
                    .fail(function (error) {
                        console.log(error);
                    });
    });


    $('#form-new-user').submit(function (e) {
        e.preventDefault();
        var newUserData = {
            'username': $(this).find('input[name="username"]').val(),
            'email': $(this).find('input[name="email"]').val(),
            'password': $(this).find('input[name="password"]').val(),
            'password_confirm': $(this).find('input[name="password_confirm"]').val(),
            'profile': {}
        }
        $.ajax({
            url : "/api/users/",
            data : JSON.stringify(newUserData),
            type : 'POST',
            contentType : 'application/json',
            processData: false,
            dataType: 'json',
            success: function( data ) {
                insertUser(data);
                $('#form-new-user')[0].reset();
            },
            error: function(xhr, status, error) {
                console.log(error);
            },
        });
    });


    $('#log-out-toggler').click(function(e) { 
    	$.post("ajax_auth/logout/", $(this).serialize(),function (data) {
        	$("#signin-box").show();
			$("#signin-box-toggler").show();
			$("#user-panel-wrapper").hide();
            $("#admin-panel-wrapper").hide();
            $("#text-navbar").hide();
            $("#new-user").hide();
			$("#log-out").hide();
        })
    });

    $('#admin-panel-toggler').click(function(e) {  
            $("#user-panel-wrapper").hide();
            $("#admin-panel-wrapper").show();
            $("#admin-panel-toggler").hide();
            $("#user-panel-toggler").show();
    });

    $('#user-panel-toggler').click(function(e) {
            $("#user-panel-wrapper").show();
            $("#admin-panel-wrapper").hide();
            $("#admin-panel-toggler").show();
            $("#user-panel-toggler").hide();
      })

    $("#edit-daily-goal").click(function(e) {
        displayDailyGoalUpdater();
    });


    $('#filter-form').submit(function (e) {
        e.preventDefault();
    });

    $('#set-filter').click(function(e) {  
        filterIntakes();
    });

    $('#reset-filter').click(function(e) {  
        resetFilter();
        $('#filter-form')[0].reset();
    });

    $('#content').on('click', '.delete-intake', function(){
        var intakeId = $(this).closest(".calorie-intake").attr('id').slice(15,18);
        deleteCalorieIntake(intakeId);
    });

    $('#content').on('click', '.edit-intake', function(){
        var intakeId = $(this).closest(".calorie-intake").attr('id').slice(15,18);
        displayCalorieIntakeUpdater(intakeId);
    });

    $('#content').on('click', '.save-intake', function(){
        event.preventDefault();
        var intakeId = $(this).closest(".calorie-intake-edit").attr('id').slice(20,23);
        editCalorieIntake(intakeId);
    });

    $('#content').on('click', '.delete-user', function(){
        var userId = $(this).closest(".user").attr('id').slice(5,8);
        deleteUser(userId);
    });

    $('#content').on('click', '.edit-user', function(){
        var userId = $(this).closest(".user").attr('id').slice(5,8);
        displayUserUpdater(userId);
    });

    $('#content').on('click', '.save-user', function(){
        event.preventDefault();
        var userId = $(this).closest(".user-edit").attr('id').slice(10,13);
        editUser(userId);
    });

    $('#content').on('click', '.display-intakes', function(){
        var userId = $(this).closest(".user").attr('id').slice(5,8);
        toggleDisplayIntakes(userId);
    });

    $('#content').on('click', '.new-user-intake', function(){
        event.preventDefault();
        var userId = $(this).closest(".calorie-intake-create").attr('id').slice(19,22);
        createCalorieIntake(userId);
        $('#form-new-intake-'+userId)[0].reset();
    });

	$('.box-toggler').click(function(e) {
    	$(".auth-box").toggle();
    	$(".box-toggler").toggle();
    });

    $('#content').on('click', '.datetimepicker', function () {
    $(this).datetimepicker().datetimepicker( "show" );
  });

    $( "#datepicker-start" ).datetimepicker({
    	timepicker: false,
    	defaultTime:'00:00'
    });
    $( "#datepicker-end" ).datetimepicker({
    	timepicker: false,
    	defaultTime:'23:59'
    });
    $( ".timepicker" ).datetimepicker({
    	datepicker: false,
    	format: 'H:i'
    });
});


function userSetup(repaint) {
    // Get info from DB
    var jqxhr = $.get("/api/users/me/",
                    function (data) {
                        loggedUser = data
                        updateDailyGoalPanel();
                        updateCalorieLog(loggedUser, '#calorie-intake-list');
                        if (loggedUser.profile.is_manager || loggedUser.is_superuser) {
                            adminSetup(repaint);
                        }
                        if (repaint == true) {
                            $("#user-panel-wrapper").show();
                            $("#text-navbar").show();
                        }
                    })
                    .fail(function (err) {
                        $("#signin-box").show();
                        $("#signin-box-toggler").show();
                    });
}

function adminSetup(repaint) {
    var jqxhr = $.get("/api/users/",
                    function (data) {
                        updateUsersList(data.results);
                        if (repaint == true){
                            $("#admin-panel-toggler").show();
                            $("#new-user").show();
                        }
                    })
                    .fail(function (error) {
                        console.log(error);
                    });
}

function updateDailyGoalPanel() {
    $("#edit-daily-goal").show()
    $("#calorie-record").show()
    $("#update-daily-goal").hide()
    $("#inline-daily-goal").html(loggedUser.profile.expected_calories);
    var dailyTotal = 0;
    for (index in loggedUser.profile.calorie_intakes) {
        var intake = loggedUser.profile.calorie_intakes[index];
        var intakeDate = new Date(intake.date);
        var today = new Date();

        if(intakeDate.setHours(0,0,0,0) == today.setHours(0,0,0,0)){
            dailyTotal = dailyTotal + intake.calories;
        }
    }
    $("#inline-total").html(dailyTotal);
    if (dailyTotal > loggedUser.profile.expected_calories) {
        $("#daily-goal").addClass('over-limit');
    } else {
        $("#daily-goal").removeClass('over-limit');
    }
}

function displayDailyGoalUpdater() {
    var placeholder = $("#inline-daily-goal").html()
    $("#inline-daily-goal").html(
        '<input id="daily-goal-input" type="text" placeholder="'+placeholder+'" class="small-text-input">'
    )
    $("#edit-daily-goal").hide();
    $("#calorie-record").hide();
    $("#update-daily-goal").show();
}


function updateCalorieLog(user, appendPoint) {
    $(appendPoint).empty();
    for (intake in user.profile.calorie_intakes) {
        insertCalorieIntake(user.profile.calorie_intakes[intake],appendPoint);
    }
}

function insertCalorieIntake(intake, appendPoint){
    var template = $('#calorie-intake-row').html()
    var dateObject = new Date(intake.date);
    var formattedDate = String(dateObject).slice(4,21)
    var updatedTemplate = template.replace(/{id}/g, intake.id)
                              .replace(/{date}/g, formattedDate)
                              .replace(/{calories}/g, intake.calories)
                              .replace(/{description}/g, intake.description);
    $(appendPoint).prepend(updatedTemplate);
}

function updateUsersList(users) {
    $('#user-list').empty();
    for (i in users) {
        if (users[i].username != loggedUser.username) {
            insertUser(users[i]);
        }
    }
}

function insertUser(data){
    var template = $('#user-row').html();
    if (data.profile.is_manager) {
        var is_manager = 'yes';
    } else {
        var is_manager = 'no';
    }
    var updatedTemplate = template.replace(/{id}/g, data.id)
                              .replace(/{name}/g, data.username)
                              .replace(/{email}/g, data.email)
                              .replace(/{is-manager}/g, is_manager)
                              .replace(/{calories}/g, data.profile.expected_calories);
    $('#user-list').prepend(updatedTemplate);
    if (loggedUser.is_superuser) {
        updateCalorieLog(data,'#user-'+data.id+'-intakes');
    } else {
        $("#collapse-controls-"+data.id).remove();
    }
}


function deleteCalorieIntake(intake){
    var calorieIntakeDelete = $.ajax({
            url : "/api/calorie-intakes/"+intake+"/",
            type : 'DELETE',
            success: function( data ) {
                $('#calorie-intake-'+intake).remove();
                userSetup(false);
            },
            error: function(xhr, status, error) {
                console.log(error);
            },
        });
}

function deleteUser(user){
    var userDelete = $.ajax({
            url : "/api/users/"+user+"/",
            type : 'DELETE',
            success: function( data ) {
                $('#user-group-'+user).remove();
            },
            error: function(xhr, status, error) {
                console.log(error);
            },
        });
}


function editCalorieIntake(intake){
    var intakeData = {}
    if ($('#intake-date-field-'+intake).val()) {
        var parsedDate = new Date($('#intake-date-field-'+intake).val());
        intakeData['date'] = parsedDate.toISOString();
    }

    if ($('#intake-calories-field-'+intake).val()) {
        intakeData['calories'] = $('#intake-calories-field-'+intake).val();
    }

    if ($('#intake-description-field-'+intake).val()) {
        intakeData['description'] = $('#intake-description-field-'+intake).val();
    }

    var calorieIntakePatch = $.ajax({
            url : "/api/calorie-intakes/"+intake+"/",
            data : JSON.stringify(intakeData),
            type : 'PATCH',
            contentType : 'application/json',
            processData: false,
            dataType: 'json',
            success: function( data ) {
                var dateObject = new Date(data.date)
                var formattedDate = String(dateObject).slice(4,21)
                $("#intake-date-"+intake).html(formattedDate);
                $("#intake-calories-"+intake).html("<b>"+data.calories+"</b>");
                $("#intake-description-"+intake).html(data.description);
                $("#edit-calorie-intake-"+intake).hide();
                $("#calorie-intake-"+intake).show();
                userSetup(false);
            },
            error: function(xhr, status, error) {
                console.log(error);
            },
    });
}


function createCalorieIntake(userId){

    var parsedDate = new Date($('#intake-date-field-'+userId).val());
    var intakeData = {
            "user": "http://127.0.0.1:8000/api/users/"+userId+"/",
            "date": parsedDate.toISOString(),
            "calories": $('#intake-calories-field-'+userId).val(),
            "description": $('#intake-description-field-'+userId).val(),
    }
    var appendPoint = "#user-"+userId+"-intakes";
    var calorieIntakePost = $.ajax({
            url : "/api/calorie-intakes/",
            data : JSON.stringify(intakeData),
            type : 'POST',
            contentType : 'application/json',
            processData: false,
            dataType: 'json',
            success: function( data ) {
                var dateObject = new Date(data.date);
                var formattedDate = String(dateObject).slice(4,21);
                insertCalorieIntake(data,appendPoint);
                $(appendPoint).show();
            },
            error: function(xhr, status, error) {
                console.log(error);
            },
    });
}


function editUser(user){
    var userData = {};
    userData['profile'] = {}
    if ($("#user-name-field-"+user).val()) {
            userData['username'] = $("#user-name-field-"+user).val();
    }
    if ($("#user-email-field-"+user).val()) {
            userData['email'] = $("#user-email-field-"+user).val();
    }
    if ($("#user-is-manager-field-"+user).prop("checked")) {
            userData['profile']['is_manager'] = true;
    } else {
        userData['profile']['is_manager'] = false;
    }
    if ($("#user-calories-field-"+user).val()) {
            userData['profile']['expected_calories'] = parseInt($("#user-calories-field-"+user).val(), 10);
    }
    var userPatch = $.ajax({
            url : "/api/users/"+user+"/",
            data : JSON.stringify(userData),
            type : 'PATCH',
            contentType : 'application/json',
            processData: false,
            dataType: 'json',
            success: function( data ) {
                $("#user-name-"+user).html(data.username);
                $("#user-email-"+user).html(data.email);
                if (data.profile.is_manager) {
                    $("#user-is-manager-"+user).html('yes');
                } else {
                    $("#user-is-manager-"+user).html('no');
                }
                $("#user-calories-"+user).html(data.profile.expected_calories);
                $("#edit-user-"+user).hide();
                $("#user-"+user).show();
            },
            error: function(xhr, status, error) {
                console.log(error);
            },
    });
}

function displayCalorieIntakeUpdater(intakeId) {
    $("#intake-date-field-"+intakeId).val($("#intake-date-"+intakeId).text());
    $("#intake-calories-field-"+intakeId).val($("#intake-calories-"+intakeId).text());
    $("#intake-description-field-"+intakeId).val($("#intake-description-"+intakeId).text());
    $("#calorie-intake-"+intakeId).hide();
    $("#edit-calorie-intake-"+intakeId).show();
}

function displayUserUpdater(user) {
    $("#user-"+user).hide();
    $("#edit-user-"+user).show();
}

function toggleDisplayIntakes(user) {
    $("#user-"+user+"-intakes").toggle();
    $("#new-calorie-intake-"+user).toggle();
    $("#user-"+user).find('.display-intakes').toggleClass('chevron-hidden');
}

function filterIntakes() {
    var date_from = new Date($('#datepicker-start').val()).getTime();
    var date_to = new Date($('#datepicker-end').val()).getTime();
    var time_from = $('#timepicker-start').val().slice(0,2)+'00';
    var time_to = $('#timepicker-end').val().slice(0,2)+'00';

    $('#calorie-intake-list').find('.calorie-intake-group').each(function(){
        datetime = new Date($(this).find('.intake-date').html());
        var date = String(datetime.getTime());
        var time = '';
        var hour = String(datetime.getHours());
        var minutes = String(datetime.getMinutes());

        if (hour.length == 2) {
            time = time + hour;
        } else {
            time = time + '0' + hour;
        }
        if (minutes.length == 2) {
            time = time + minutes;
        } else {
            time = time + '0' + minutes;
        }

        if (date > date_from && date < date_to && time > time_from && time < time_to) {
            $(this).show();
        } else {
            $(this).hide();
        }
    })
}

function resetFilter() {
    $('#calorie-intake-list').find('.calorie-intake-group').each(function(){
        $(this).show();
    })
}
