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
from pprint import pprint


def exportlog(log, fname, reduceuu=True):
    outlog = deepcopy(log)
    for entry in outlog:
        if reduceuu:
            entry[LK.UUSERS] = len(entry[LK.UUSERS])
        else:
            entry[LK.UUSERS] = list(entry[LK.UUSERS])
    s = "count of unique users" if reduceuu else "unique users as list"
    print "exporting log to {} with".format(fname, s)
    with open(fname, 'w') as f:
        json.dump(outlog, f)


def importlog(fname):
    with open(fname) as f:
        log = json.load(f)
    try:
        for entry in log:
            entry[LK.UUSERS] = set(entry[LK.UUSERS])
    except TypeError as e:
        print e
    return log


def printlog(log):
    """ Pretty print a log """
    print json.dumps(log, sort_keys=True, indent=2, separators=(',', ': '))


def ep(entry):
    print "{}".format(entry[LK.FROM])
    print "  HTMLHITS: {:>10}".format(entry[LK.HTMLHITS])
    print "  UUSERS  : {:>10}".format(len(entry[LK.UUSERS]))


def lp(log):
    for entry in log:
        ep(entry)


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

    uusers1 = set(log1[LK.UUSERS])
    uusers2 = set(log2[LK.UUSERS])
    log_out[LK.UUSERS] = uusers1.union(uusers2)

    transfer = log1[LK.TRANSFERBYTES] + log2[LK.TRANSFERBYTES]
    log_out[LK.TRANSFERBYTES] = transfer

    log_out[LK.FROM] = min(log1[LK.FROM], log2[LK.FROM])

    log_out[LK.HTMLHITS] = log1[LK.HTMLHITS] + log2[LK.HTMLHITS]

    return log_out


def importlogs(logfilelist):
    nestedlogs = []
    for fname in logfilelist:
        log = importlog(fname)
        nestedlogs.append(log)
    return nestedlogs


def flattenlogs(nestedlogs):
    entries = []
    for log in nestedlogs:
        entries.extend(log)
    return entries


def gluesimultaneous(log):
    for i, entry in enumerate(log[:-1]):
        if entry[LK.FROM] == log[i+1][LK.FROM]:
            print i, i+1, entry[LK.FROM]


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


#def gatherlogs(Loglist):
#    """ glue a list of logs together, merging the entries at the ends """
#    totlog = []
#    for logfile in Loglist:
#        log = importlog(logfile)
#        try:
#            print len(log)
#            if totlog[-1][LK.FROM] == log[0][LK.FROM]:
#                print "Same time: ", totlog[-1][LK.FROM]
#                lastentry = totlog.pop()
#                nextentry = log[0]
#                mergedentry = mergelogs(lastentry, nextentry)
#                if not mergedentry:
#                    raise ValueError("Merged log invalid")
#                totlog.append(mergedentry)
#                totlog.extend(log[1:])
#            else:
#                totlog.extend(log)
#        except IndexError as e:
#            if totlog == [] or log == []:
#                pass
#            else:
#                raise e
#    return totlog


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
    return newlog


def alignlog(log, utc_hour='22'):
        for i, entry in enumerate(log):
            hour, minute = entry[LK.FROM][11:13], entry[LK.FROM][14:16]
            if hour == utc_hour and minute == '00':
                break
        return log[i:]


def log2lists(logs):
    a, b, c, d, e, f = [], [], [], [], [], []
    for log in logs:
        a.append([v for k, v in log.iteritems() if k == LK.FROM])
        b.append([v for k, v in log.iteritems() if k == LK.UUSERS])
        c.append([v for k, v in log.iteritems() if k == LK.TOTHITS])
        d.append([v for k, v in log.iteritems() if k == LK.TRANSFERBYTES])
        e.append([v for k, v in log.iteritems() if k == LK.HTMLHITS])
        f.append([v for k, v in log.iteritems() if k == LK.HTTPSTATUS])
    lists = {LK.FROM: a,
             LK.UUSERS: b,
             LK.TOTHITS: c,
             LK.TRANSFERBYTES: d,
             LK.HTMLHITS: e,
             LK.HTTPSTATUS: f}
    return lists


if __name__ == '__main__':
    logdir = 'output'
    routdir = 'test/'
    outname = 'wc98_log_'
    ext = 'hour.json'
    interval = 0.25

    Logs = createloglist(logdir)
    log = gatherlogs(Logs)
    log = alignlog(log)

    path = logdir + '/' + outname + 'gathered.json'
    exportlog(log, path, reduceuu=False)

    rlog = deepcopy(log)

    for rfact, factor in [(1, 1), (4, 4), (2, 8), (3, 24), (2, 48), (2, 96)]:
        hrs = int(interval*factor)
        hrs = '0.25' if not hrs else str(hrs)
        rpath = routdir + outname + hrs + ext
        rlog = reducelogs(rlog, rfact)
        print "logs reduced by factor {}".format(factor)
        print "interval is now " + hrs + " hours"
        print "Testing all entries have timestamp, ", checklog(rlog)
        exportlog(rlog, rpath)

    rpath = routdir + 'wc98_aggr.json'
    raggregated = reduce(mergelogs, rlog)
    exportlog([raggregated], rpath)
