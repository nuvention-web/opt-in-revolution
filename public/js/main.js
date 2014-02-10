$(document).ready(function() {


	// Events for About Us Tab views
	$('.opt-about-pillars-detail').slideUp();

	$('.pillar-employ').on('click', function() {
		$('.opt-about-pillars-detail').not('#employ').slideUp();
		$('#employ').slideToggle();
	});

	$('.pillar-empower').on('click', function() {
		$('.opt-about-pillars-detail').not('#empower').slideUp();
		$('#empower').slideToggle();
	});

	$('.pillar-engage').on('click', function() {
		$('.opt-about-pillars-detail').not('#engage').slideUp();
		$('#engage').slideToggle();
	});

});
