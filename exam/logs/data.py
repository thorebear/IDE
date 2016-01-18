#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
Created on Tue Jan 12 16:16:35 2016

@author: koeus
"""
import sys
from time import gmtime, strftime, strptime
import json
import calendar


class LogKeys:
    FROM = 'from'
    UUSERS = 'unique_users'
    TOTHITS = 'total_hits'
    TRANSFERBYTES = 'transferred_bytes'
    HTMLHITS = 'htmlhits'
    HTTPSTATUS = 'httpstatus'
#    HTTPMETHOD = 'httpmethod'
#    HTTPVERSION = 'httpversion'
#    VIEWSPERPAGE = 'views_per_page'

LK = LogKeys


def parsetimeinterval(tstr, timeleap, timefmt):
    time_struct = strptime(tstr, timefmt)
    time_secs = calendar.timegm(time_struct)
    return time_secs - time_secs % timeleap


def logreduce(workfile, timeleap=900):
    uuserid = 0
#    username1 = 1      # unused - always '-'
#    username2 = 2      # unused - always '-'
    time_stamp = 3
#    time_offset = 4    # unused - allways '+0000'
#    http_method = 5
    http_url = 6
#    http_version = 7   # unused
#    http_status = 8    # unused
    transfer = 9
#    httpmethods = {'GET': 0, 'HEAD': 0, 'POST': 0, 'PUT': 0, 'DELETE': 0,
#                   'TRACE': 0, 'OPTIONS': 0, 'CONNECT': 0, 'OTHER': 0}
#    httpversioncodes = {'HTTP/0.9': 0, 'HTTP/1.0': 0,
#                        'HTTP/1.1': 0, 'HTTP/X.X': 0}
#    httpstatuscodes = {'1xx': 0, '2xx': 0, '3xx': 0,
#                       '4xx': 0, '5xx': 0, '-xx': 0}
    logtimefmt = "%d/%b/%Y:%H:%M:%S"
    jsontimefmt = "%Y-%m-%dT%H:%M:%S.000Z"
    progress = "{:<20}: lines processed: {:>20}"

    log = []

    logentry = {}
    uniqueusers = set()
    tothits, htmlhits, agg_transfer = 0, 0, 0

    linenumber = 0

    with open(workfile) as f:
        print ""
        line = f.readline()
        try:
            item = line.split()
            timestr = item[time_stamp].strip('[')
            currenttimegroup = parsetimeinterval(timestr, timeleap, logtimefmt)
        except IndexError:
            pass
        except UnboundLocalError:
            pass
        while line != "":
            linenumber += 1
            item = line.split(" ")
            # parse time and date to int
            timestr = item[time_stamp].strip('[')
            timegroup = parsetimeinterval(timestr, timeleap, logtimefmt)

            if timegroup != currenttimegroup:
                # store aggregated values in single log entry
                time_val = strftime(jsontimefmt, gmtime(currenttimegroup))
                logentry = {}
                logentry[LK.FROM] = time_val
                logentry[LK.UUSERS] = list(uniqueusers)
                logentry[LK.TOTHITS] = tothits
                logentry[LK.TRANSFERBYTES] = agg_transfer
                logentry[LK.HTMLHITS] = htmlhits

                # store aggregated entry in bigger log associated with time
                log.append(logentry)
                # reset counters, etc.
                currenttimegroup = timegroup
                uniqueusers = set()
                tothits, htmlhits, agg_transfer = 0, 0, 0

            # update all aggregators
            uniqueusers.add(int(item[uuserid]))
            tothits += 1
            try:
                agg_transfer += int(item[transfer].strip('\n'))
            except ValueError:
                pass

            try:
                url = item[http_url]
                if '.html' in url:
                    htmlhits += 1
            except UnicodeDecodeError:
                pass

            if linenumber % 1000000 == 0:
                print progress.format(workfile, linenumber)
            # read next line and do while check
            line = f.readline()

        # add last entry
        print progress.format(workfile, linenumber)
        try:
            time_val = strftime(jsontimefmt, gmtime(currenttimegroup))
            logentry = {
                LK.FROM: time_val,
                LK.UUSERS: list(uniqueusers),
                LK.TOTHITS: tothits,
                LK.TRANSFERBYTES: agg_transfer,
                LK.HTMLHITS: htmlhits
            }
            log.append(logentry)
        except UnboundLocalError as e:
            print e
    return log


if __name__ == '__main__':
    clf_log = sys.argv[1]
    json_log = sys.argv[2]

    log = logreduce(clf_log)

    with open(json_log, 'w') as f:
        json.dump(log, f, sort_keys=True)
