$(document).ready(function() {

	// NavBar 


	// About Page
	// For fading out other tabs
	$('#employ').stop().hover(function() {
		$('#employ').stop().fadeTo("fast",1)

		$('#empower').stop().fadeTo("fast",0.5)
		$('#engage').stop().fadeTo("fast",0.5)
	});

	$('#empower').stop().hover(function() {
		$('#empower').stop().fadeTo("fast",1)

		$('#employ').stop().fadeTo("fast",0.5)
		$('#engage').stop().fadeTo("fast",0.5)
	});

	$('#engage').stop().hover(function() {
		$('#engage').stop().fadeTo("fast",1)

		$('#employ').stop().fadeTo("fast",0.5)
		$('#empower').stop().fadeTo("fast",0.5)
	});



});
