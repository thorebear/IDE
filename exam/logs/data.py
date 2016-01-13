#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
Created on Tue Jan 12 16:16:35 2016

@author: koeus
"""
import sys
from time import gmtime, strftime, strptime, mktime
from copy import deepcopy
import json


class LogKeys:
    FROM = 'from'
    UUSERS = 'unique_users'
    TOTHITS = 'total_hits'
    TRANSFERBYTES = 'transferred_bytes'
    HTMLHITS = 'htmlhits'
    HTTPMETHOD = 'httpmethod'
    HTTPSTATUS = 'httpstatus'
    HTTPVERSION = 'httpversion'
    VIEWSPERPAGE = 'views_per_page'

LK = LogKeys


def parsetimeinterval(tstr, timeleap, timefmt):
    time_struct = strptime(tstr, timefmt)
    time_secs = mktime(time_struct)
    return time_secs - time_secs % timeleap


def logreduce(workfile, timeleap=900):
    uuserid = 0
#    username1 = 1      # unused - always '-'
#    username2 = 2      # unused - always '-'
    time_stamp = 3
#    time_offset = 4    # unused - allways '+0000'
    http_method = 5
    http_url = 6
    http_version = 7
    http_status = 8
    transfer = 9
    httpmethods = {'GET': 0, 'HEAD': 0, 'POST': 0, 'PUT': 0, 'DELETE': 0,
                   'TRACE': 0, 'OPTIONS': 0, 'CONNECT': 0, 'OTHER': 0}
    httpversioncodes = {'HTTP/0.9': 0, 'HTTP/1.0': 0,
                        'HTTP/1.1': 0, 'HTTP/X.X': 0}
    httpstatuscodes = {'1xx': 0, '2xx': 0, '3xx': 0,
                       '4xx': 0, '5xx': 0, '-xx': 0}
    logtimefmt = "%d/%b/%Y:%H:%M:%S"
    jsontimefmt = "%Y-%m-%dT%H:%M:%S.000Z"
    progress = "{:<20}: lines processed: {:>20}"

    log = []
    uniqueusers = set()
    tothits, htmlhits, agg_transfer = 0, 0, 0
    httpstatus = deepcopy(httpstatuscodes)
    httpversion = deepcopy(httpversioncodes)
    httpmethod = deepcopy(httpmethods)
    viewsperpage = {}
    linenumber = 0

    with open(workfile) as f:
        line = f.readline()

        item = line.split()
        timestr = item[time_stamp].strip('[')
        currenttimegroup = parsetimeinterval(timestr, timeleap, logtimefmt)

        while line != "":
            linenumber += 1
            logentry = {}
            # do stuff
            item = line.split(" ")

            # parse time and date to int
            timestr = item[time_stamp].strip('[')
            timegroup = parsetimeinterval(timestr, timeleap, logtimefmt)

            if timegroup != currenttimegroup:
                # store aggregated values in single log entry
                time_val = strftime(jsontimefmt, gmtime(currenttimegroup))
                logentry = {}
                logentry[LK.FROM] = time_val
                logentry[LK.UUSERS] = len(uniqueusers)
                logentry[LK.TOTHITS] = tothits
                logentry[LK.TRANSFERBYTES] = agg_transfer
                logentry[LK.HTMLHITS] = htmlhits
                logentry[LK.HTTPMETHOD] = httpmethod
                logentry[LK.HTTPSTATUS] = httpstatus
                logentry[LK.HTTPVERSION] = httpversion
                logentry[LK.VIEWSPERPAGE] = viewsperpage

                # store aggregated entry in bigger log associated with time
                log.append(logentry)
#                print len(uniqueusers)
#                print tothits
#                print agg_transfer
#                print htmlhits
#                print httpmethod
#                print httpstatus
#                print httpversion

                # reset counters, etc.
                currenttimegroup = timegroup
                uniqueusers = set()
                tothits, htmlhits, agg_transfer = 0, 0, 0
                httpstatus = deepcopy(httpstatuscodes)
                httpversion = deepcopy(httpversioncodes)
                httpmethod = deepcopy(httpmethods)
                viewsperpage = {}

            try:  # update all aggregators
                uniqueusers.add(int(item[uuserid]))
                tothits += 1
                try:
                    agg_transfer += int(item[transfer].strip('\n'))
                except ValueError as e:
                    pass

                try:
                    url = item[http_url]
                    if '.html' in url:
                        url_utf8 = unicode(url, 'utf-8')
                        if url not in viewsperpage:
                            viewsperpage[url_utf8] = 1
                        else:
                            viewsperpage[url_utf8] += 1
                        htmlhits += 1
                except UnicodeDecodeError as e:
                    print e

                httpstatcode = item[http_status][0]+'xx'
                httpstatus[httpstatcode] += 1

                httpmethodcode = item[http_method].strip('"')
                httpmethod[httpmethodcode] += 1

                httpversioncode = item[http_version].strip('"')
                httpversion[httpversioncode] += 1

            # be able to skip invalid entries without failing
            except ValueError as e:
                print e
            except IndexError as e:
                print e

            if linenumber % 1000000 == 0:
                print progress.format(workfile, linenumber)

            # read next line and do while check
#            print line.strip('\n')
            line = f.readline()

        # add last entry
        time_val = strftime(jsontimefmt, gmtime(currenttimegroup))
#        print time_val
        logentry = {}
        logentry[LK.FROM] = time_val
        logentry[LK.UUSERS] = len(uniqueusers)
        logentry[LK.TOTHITS] = tothits
        logentry[LK.TRANSFERBYTES] = agg_transfer
        logentry[LK.HTMLHITS] = htmlhits
        logentry[LK.HTTPMETHOD] = httpmethod
        logentry[LK.HTTPSTATUS] = httpstatus
        logentry[LK.HTTPVERSION] = httpversion
        logentry[LK.VIEWSPERPAGE] = viewsperpage
        log.append(logentry)

    return log


if __name__ == '__main__':
    clf_log = sys.argv[1]
    json_log = sys.argv[2]

    log = logreduce(clf_log)

    with open(json_log, 'w') as f:
        json.dump(log, f, sort_keys=True)
