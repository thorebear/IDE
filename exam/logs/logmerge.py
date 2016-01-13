#! /usr/bin/python
# -*- coding: utf-8 -*-
"""
Created on Wed Jan 13 12:58:51 2016

@author: koeus
"""

from copy import deepcopy
import json
import os
import sys
from data import LogKeys as lk


def mergelogs(log1, log2):
    log_out = {}
    log_out[lk.TOTHITS] = log1[lk.TOTHITS] + log2[lk.TOTHITS]

    # ALERT! KNOWLEDGE LOST! INTERPOLATING VIA RATIOS
    hits_per_uuser_ratio1 = log1[lk.UUSERS] / log1[lk.TOTHITS]
    hits_per_uuser_ratio2 = log2[lk.UUSERS] / log2[lk.TOTHITS]
    avg_ratio = (hits_per_uuser_ratio1 + hits_per_uuser_ratio2) / 2.0
    log_out[lk.UUSERS] = avg_ratio * log_out[lk.TOTHITS]

    transfer = log1[lk.TRANSFERBYTES] + log2[lk.TRANSFERBYTES]
    log_out[lk.TRANSFERBYTES] = transfer

    log_out[lk.FROM] = min(log1[lk.FROM], log2[lk.FROM])

    log_out[lk.HTMLHITS] = log1[lk.HTMLHITS] + log2[lk.HTMLHITS]

    log_out[lk.HTTPMETHOD] = deepcopy(log1[lk.HTTPMETHOD])
    for key in log2[lk.HTTPMETHOD]:
        log_out[lk.HTTPMETHOD][key] += log2[lk.HTTPMETHOD][key]

    log_out[lk.HTTPSTATUS] = deepcopy(log1[lk.HTTPSTATUS])
    for key in log2[lk.HTTPSTATUS]:
        log_out[lk.HTTPSTATUS][key] += log2[lk.HTTPSTATUS][key]

    log_out[lk.HTTPVERSION] = deepcopy(log1[lk.HTTPVERSION])
    for key in log2[lk.HTTPVERSION]:
        log_out[lk.HTTPVERSION][key] += log2[lk.HTTPVERSION][key]

    log_out[lk.VIEWSPERPAGE] = deepcopy(log1[lk.VIEWSPERPAGE])
    for key in log2[lk.VIEWSPERPAGE]:
        if key in log1[lk.VIEWSPERPAGE]:
            log_out[lk.VIEWSPERPAGE][key] += log2[lk.VIEWSPERPAGE][key]
        else:
            log_out[lk.VIEWSPERPAGE][key] = log2[lk.VIEWSPERPAGE][key]


def createloglist(directory):
    logpaths = []
    for root, dirs, files in os.walk(directory):
        for f in files:
            fn = os.path.join(root, f)
            if fn[-5:] == '.json':
                logpaths.append(fn)
    print "located {} json files in source dir".format(len(logpaths))
    logpaths.sort()
    return logpaths


def gatherlogs(Loglist, outdir, outfile='wc98_complete.json'):
    totlog = []
    for logfile in Loglist:
        with open(logfile) as f:
            log = json.load(f)
            try:
                if totlog[-1][lk.FROM] == log[0][lk.FROM]:
                    lastlog = totlog.pop()
                    log[0] = mergelogs(log[0], lastlog)
            except IndexError as e:
                if not totlog == []:
                    raise e

            totlog.extend(log)
    with open(outdir+'/'+outfile, 'w') as f:
        json.dump(totlog, f, sort_keys=True)
    print "{} log entries collected in {}".format(len(totlog), outfile)


def reducelog(logfile, factor):
    """ Compress a single logfile with a factor"""
    with open(logfile) as f:
        logs = json.load(f)
        for log in logs:
            pass


if __name__ == '__main__':
    logdir = sys.argv[1]

    Logs = createloglist(logdir)
    gatherlogs(Logs, logdir)
