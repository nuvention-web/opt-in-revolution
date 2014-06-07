$(document).ready(function() {
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

	// var website= 'www.opentable.com'.split(''); //your text
	// var valuWebsite=$('input#website').val(); //store current value in the space you want to be typed into
	// var delay=100;
	// $('input#website').keypress(function (e) { 
	// 	console.log("pressed")
	// 	if (e.keyCode == 59) { 
	// 		console.log('you pressed keycode 186')
	// 		for (var i=0; i<website.length;i++){   
 //    			setTimeout(function(){        
 //    				valuWebsite = valuWebsite.concat(website.shift());
 //    				console.log(valuWebsite)
 //        			$('input#website').val(valuWebsite)
 //    			}, delay * i)       
	// 		}
	// 	} 
	// });


	// var jobName='Market Expansion Strategy'.split(''); //your text
	// var valuJobName=$('input#jobName').val(); //store current value in the space you want to be typed into
	// var delay=100;
	// $('input#jobName').keypress(function (e) { 
	// 	console.log("pressed")
	// 	if (e.keyCode == 59) { 
	// 		console.log('you pressed keycode 186')
	// 		for (var i=0; i<jobName.length;i++){   
 //    			setTimeout(function(){        
 //    				valuJobName = valuJobName.concat(jobName.shift());
 //    				console.log(valuJobName)
 //        			$('input#jobName').val(valuJobName)
 //    			}, delay * i)       
	// 		}
	// 	} 
	// });

	// var description='OpenTable is looking to improve penetration of young restaurant goers in the southeastern US. We are looking for a proven marketer or brand manager to do a project that outlines a potential multi-channel strategy to acquire these consumers.  Some work has already been done and your experience and findings will supplement current efforts.'.split(''); //your text
	// var valuDes = $('textarea#description').val(); //store current value in the space you want to be typed into
	// var delay=1;
	// $('textarea#description').keypress(function (e) { 
	// 	console.log("pressed")
	// 	if (e.keyCode == 59) { 
	// 		console.log('you pressed keycode 186 - description')
	// 		for (var i=0; i<description.length;i++){   
 //    			setTimeout(function(){        
 //    				valuDes = valuDes.concat(description.shift());
 //    				console.log(valuDes)
 //        			$('textarea#description').val(valuDes)
 //    			}, delay*(i/2))       
	// 		}
	// 	} 
	// });

	// var skillsNeeded='Marketing, Market strategy'.split(''); //your text
	// var valuSkills=$('textarea#skillsNeeded').val(); //store current value in the space you want to be typed into
	// var delay=100;
	// $('textarea#skillsNeeded').keypress(function (e) { 
	// 	console.log("pressed")
	// 	if (e.keyCode == 59) { 
	// 		console.log('you pressed keycode 186')
	// 		for (var i=0; i<skillsNeeded.length;i++){   
 //    			setTimeout(function(){        
 //    				valuSkills = valuSkills.concat(skillsNeeded.shift());
 //    				console.log(valuSkills)
 //        			$('textarea#skillsNeeded').val(valuSkills)
 //    			}, delay * i)       
	// 		}
	// 	} 
	// });

	var jobExp= 'I have had previous experience working on projects geared towards expanding brand presence to different markets by identifying and targeting new customer segments.'.split(''); //your text
	var valujobExp=$('textarea#relevantJobExperience').val(); //store current value in the space you want to be typed into
	var delay=100;
	$('textarea#relevantJobExperience').keypress(function (e) { 
		console.log("pressed")
		if (e.keyCode == 59) { 
			console.log('you pressed keycode 186')
			for (var i=0; i<jobExp.length;i++){   
    			setTimeout(function(){        
    				valujobExp = valujobExp.concat(jobExp.shift());
    				console.log(valujobExp)
        			$('textarea#relevantJobExperience').val(valujobExp)
    			}, delay * (i/4))       
			}
		} 
	});

	var projApproach= 'Review current work and identify areas for improvement. Evaluate current company customer acquisition channels and adapt for use in the southeastern US market, identifying different channels as necessary.'.split(''); //your text
	var valuprojApproach=$('textarea#projectApproach').val(); //store current value in the space you want to be typed into
	var delay=100;
	$('textarea#projectApproach').keypress(function (e) { 
		console.log("pressed")
		if (e.keyCode == 59) { 
			console.log('you pressed keycode 186')
			for (var i=0; i<projApproach.length;i++){   
    			setTimeout(function(){        
    				valuprojApproach = valuprojApproach.concat(projApproach.shift());
    				console.log(valuprojApproach)
        			$('textarea#projectApproach').val(valuprojApproach)
    			}, delay * (i/4))
			}
		} 
	});

});

var jobCategories = ['industry','jobFunction','desiredProjectLength','desiredHoursPerWeek','checkinFrequency','communicationPreferences'];