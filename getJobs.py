from indeed import IndeedClient
import csv

client = IndeedClient(publisher = 2186395790213512)

tot = []
for i in range(0, 8):
	params = {
	    'q' : "marketing",
	    'userip' : "1.2.3.4",
	    'useragent' : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2)",
	    'format' : 'json',
	    'limit' : 25,
	    'start' : i*25
	}
	sr = client.search(**params)
	for j in range(0, len(sr['results'])):
		tot.append(sr['results'][j])

allJobs = []
for i in range(0, len(tot)):
	currJob = []
	currJob.append(tot[i]['jobtitle'].encode('ascii', 'ignore'))
	currJob.append(tot[i]['url'].encode('ascii', 'ignore'))
	currJob.append(tot[i]['city'].encode('ascii', 'ignore'))
	currJob.append(tot[i]['date'].encode('ascii', 'ignore'))
	currJob.append(tot[i]['company'].encode('ascii', 'ignore'))
	currJob.append(tot[i]['snippet'].encode('ascii', 'ignore'))
	currJob.append(tot[i]['source'].encode('ascii', 'ignore'))
	currJob.append(tot[i]['jobkey'].encode('ascii', 'ignore'))
	allJobs.append(currJob)

fil = open('results.csv', 'w')
for i in range(0, len(allJobs)):
	fil.write(",".join(allJobs[i]) + '\n')

fil.close()
print "Got {0} jobs.\n".format(len(allJobs))