$(document).ready(function() {

	// NavBar 
	// About Page
	// For fading out other tabs
	// $('#employ').stop().hover(function() {
	// 	$('#employ').stop().fadeTo("fast",1)

	// 	$('#empower').stop().fadeTo("fast",0.5)
	// 	$('#engage').stop().fadeTo("fast",0.5)
	// });

	// $('#empower').stop().hover(function() {
	// 	$('#empower').stop().fadeTo("fast",1)

	// 	$('#employ').stop().fadeTo("fast",0.5)
	// 	$('#engage').stop().fadeTo("fast",0.5)
	// });

	// $('#engage').stop().hover(function() {
	// 	$('#engage').stop().fadeTo("fast",1)

	// 	$('#employ').stop().fadeTo("fast",0.5)
	// 	$('#empower').stop().fadeTo("fast",0.5)
	// });

 	$('.joblist.multiselect').multiselect({
      numberDisplayed: 0,
      includeSelectAllOption: true,
      buttonWidth: '125px',
      selectAllValue: 'Select all'
    });


    $('.postjob.multiselect').multiselect({
      numberDisplayed: 0,
      buttonWidth: '200px',
      nonSelectedText: 'Click to select'
    });

    
    // Scroll to top when any of the sidenav links are clicked
    $('li.sidenav').on("click", function() {
    	$('body').scrollTop(0);
    });

    $('.carousel').carousel('pause');

});

var jobCategories = ['industry','jobFunction','desiredProjectLength','desiredHoursPerWeek','checkinFrequency','communicationPreferences'];