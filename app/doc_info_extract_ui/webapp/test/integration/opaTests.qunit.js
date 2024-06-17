sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'docinfoextractui/test/integration/FirstJourney',
		'docinfoextractui/test/integration/pages/JobsMain'
    ],
    function(JourneyRunner, opaJourney, JobsMain) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('docinfoextractui') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheJobsMain: JobsMain
                }
            },
            opaJourney.run
        );
    }
);