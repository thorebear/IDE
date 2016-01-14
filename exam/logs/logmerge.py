#! /usr/bin/python
# -*- coding: utf-8 -*-
"""
Created on Wed Jan 13 12:58:51 2016

@author: koeus
"""

from copy import deepcopy
import json
import os
from data import LogKeys as LK
import numpy as np

MIN_VIEWS_PER_HOUR = 20


def exportlog(log, fname):
    with open(fname, 'w') as f:
        json.dump(log, f)


def importlog(fname):
    with open(fname) as f:
        log = json.load(f)
    return log


def printlog(log, skipkeys=False):
    """ Pretty print a log """
    print json.dumps(log, skipkeys=skipkeys, sort_keys=True, indent=2, separators=(',', ': '))


def checklog(log):
    """ Check that all entries in a log have a time stamp,
        thus not being all empty """
    success = True
    for i in range(len(log)):
        success &= (len(log[i][LK.FROM]) > 0)
    return success


def createloglist(directory):
    """ find the json files in a given directory and return a list of them """
    logpaths = []
    for root, dirs, files in os.walk(directory):
        for f in files:
            fn = os.path.join(root, f)
            if fn[-5:] == '.json':
                logpaths.append(fn)
    print "located {} json files in source dir".format(len(logpaths))
    logpaths.sort()
    return logpaths


def mergelogs(log1, log2):
    """ Instructions on how to merge two log entries
        most aggregators are just added, important to notice is
        timestamps: lowest are preserved, as they are starting times
        unique users: knowledge of unique users are lost, but
                      an interpolation depending on the ratio of unique users
                      and total hits in each of the merged log entries are
                      calculated."""
    log_out = {}
    if log1 and not log2:
        return log1
    if log2 and not log1:
        return log2
    log_out[LK.TOTHITS] = log1[LK.TOTHITS] + log2[LK.TOTHITS]

    # ALERT! KNOWLEDGE LOST! INTERPOLATING VIA RATIOS
    hits_per_uuser_ratio1 = 1.0 * log1[LK.TOTHITS] / log1[LK.UUSERS]
    hits_per_uuser_ratio2 = 1.0 * log2[LK.TOTHITS] / log2[LK.UUSERS]
    avg_ratio = (hits_per_uuser_ratio1 + hits_per_uuser_ratio2) / 2.0
    log_out[LK.UUSERS] = int(log_out[LK.TOTHITS] / avg_ratio)

    transfer = log1[LK.TRANSFERBYTES] + log2[LK.TRANSFERBYTES]
    log_out[LK.TRANSFERBYTES] = transfer

    log_out[LK.FROM] = min(log1[LK.FROM], log2[LK.FROM])

    log_out[LK.HTMLHITS] = log1[LK.HTMLHITS] + log2[LK.HTMLHITS]

    log_out[LK.HTTPMETHOD] = deepcopy(log1[LK.HTTPMETHOD])
    for key in log2[LK.HTTPMETHOD]:
        log_out[LK.HTTPMETHOD][key] += log2[LK.HTTPMETHOD][key]

    log_out[LK.HTTPSTATUS] = deepcopy(log1[LK.HTTPSTATUS])
    for key in log2[LK.HTTPSTATUS]:
        log_out[LK.HTTPSTATUS][key] += log2[LK.HTTPSTATUS][key]

    log_out[LK.HTTPVERSION] = deepcopy(log1[LK.HTTPVERSION])
    for key in log2[LK.HTTPVERSION]:
        log_out[LK.HTTPVERSION][key] += log2[LK.HTTPVERSION][key]

#    # remove views when finding errors
#    return log_out
    log_out[LK.VIEWSPERPAGE] = deepcopy(log1[LK.VIEWSPERPAGE])
    for key in log2[LK.VIEWSPERPAGE]:
        if key in log1[LK.VIEWSPERPAGE]:
            log_out[LK.VIEWSPERPAGE][key] += log2[LK.VIEWSPERPAGE][key]
        else:
            log_out[LK.VIEWSPERPAGE][key] = log2[LK.VIEWSPERPAGE][key]
    return log_out


def gatherlogs(Loglist):
    """ glue a list of logs together, merging the entries at the ends """
    totlog = []
    for logfile in Loglist:
        log = importlog(logfile)
        try:
            if totlog[-1][LK.FROM] == log[0][LK.FROM]:
                lastlog = totlog.pop()
                newlog = mergelogs(log[0], lastlog)
                if not newlog:
                    raise ValueError("Merged log invalid")
                log[0] = newlog
        except IndexError as e:
            if not totlog == []:
                raise e
        totlog.extend(log)
    return totlog


def reducelogs(logs, factor):
    """ Compress a single logfile with a factor on time-resolution,
        by merging 'factor' entries into new entries"""
    if factor == 1:
        return logs
    steps, rest = divmod(len(logs), factor)
    newlog = []
    for i_start in np.arange(0, len(logs), factor):
        entry = logs[i_start]
        if i_start >= steps * factor and rest:
            factor = rest
        for i in range(factor-1):
            entry = mergelogs(entry, logs[i_start+i+1])
        newlog.append(entry)
#        print entry[LK.FROM]
    return newlog


def cleanpageviews(log, hrsperentry=1):
    x = MIN_VIEWS_PER_HOUR * hrsperentry  # views per hour?
    for entry in log:
        vpp = {k: v for k, v in entry[LK.VIEWSPERPAGE].iteritems() if v >= x}
        other = [v for k, v in entry[LK.VIEWSPERPAGE].iteritems() if v < x]
        value = reduce(lambda a, b: a+b, other, 0)
        entry[LK.VIEWSPERPAGE] = vpp
        if 'other' not in entry[LK.VIEWSPERPAGE]:
            entry[LK.VIEWSPERPAGE]['other'] = value
        else:
            entry[LK.VIEWSPERPAGE]['other'] += value


def log2lists(logs):
    a, b, c, d, e, f, g, h, i = [], [], [], [], [], [], [], [], []
    for log in logs:
        a.append([v for k, v in log.iteritems() if k == LK.FROM])
        b.append([v for k, v in log.iteritems() if k == LK.UUSERS])
        c.append([v for k, v in log.iteritems() if k == LK.TOTHITS])
        d.append([v for k, v in log.iteritems() if k == LK.TRANSFERBYTES])
        e.append([v for k, v in log.iteritems() if k == LK.HTMLHITS])
        f.append([v for k, v in log.iteritems() if k == LK.HTTPMETHOD])
        g.append([v for k, v in log.iteritems() if k == LK.HTTPSTATUS])
        h.append([v for k, v in log.iteritems() if k == LK.HTTPVERSION])
        i.append([v for k, v in log.iteritems() if k == LK.VIEWSPERPAGE])
    lists = {LK.FROM: a,
             LK.UUSERS: b,
             LK.TOTHITS: c,
             LK.TRANSFERBYTES: d,
             LK.HTMLHITS: e,
             LK.HTTPMETHOD: f,
             LK.HTTPSTATUS: g,
             LK.HTTPVERSION: h,
             LK.VIEWSPERPAGE: i}
    return lists


if __name__ == '__main__':
    logdir = 'output'
    routdir = 'final/'
    coutdir = 'clean/'
    outname = 'wc98_log_'
    ext = 'hour.json'
    interval = 0.25

    Logs = createloglist(logdir)
    logs = gatherlogs(Logs)

    rlog = deepcopy(logs)
    clog = deepcopy(logs)

    for rfact, factor in [(1, 1), (4, 4), (2, 8), (3, 24), (2, 48), (2, 96)]:
        rpath = routdir + outname + str(int(interval*factor)) + ext
        cpath = coutdir + outname + str(int(interval*factor)) + ext
        rlog = reducelogs(rlog, rfact)
        clog = reducelogs(clog, rfact)
        print "logs reduced by factor {}".format(factor)
        print "interval is now " + str(int(interval * factor)) + " hours"
        print "Testing all entries have timestamp, ", checklog(rlog)
        cleanpageviews(clog, hrsperentry=factor*interval)
        exportlog(rlog, rpath)
        exportlog(clog, cpath)

    rpath = routdir + 'wc98_aggr.json'
    raggregated = reduce(mergelogs, rlog)
    exportlog(raggregated, rpath)

    cpath = coutdir + 'wc98_aggr.json'
    caggregated = reduce(mergelogs, clog)
    exportlog(caggregated, cpath)
