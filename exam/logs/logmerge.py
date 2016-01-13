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
import numpy as np


def mergelogs(log1, log2):
    log_out = {}
    if log1 and not log2:
        return log1
    if log2 and not log1:
        return log2
    log_out[lk.TOTHITS] = log1[lk.TOTHITS] + log2[lk.TOTHITS]

    # ALERT! KNOWLEDGE LOST! INTERPOLATING VIA RATIOS
    hits_per_uuser_ratio1 = 1.0 * log1[lk.TOTHITS] / log1[lk.UUSERS]
    hits_per_uuser_ratio2 = 1.0 * log2[lk.TOTHITS] / log2[lk.UUSERS]
    avg_ratio = (hits_per_uuser_ratio1 + hits_per_uuser_ratio2) / 2.0
    log_out[lk.UUSERS] = int(log_out[lk.TOTHITS] / avg_ratio)

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
    return log_out


def exportlog(log, fname):
    with open(fname, 'w') as f:
        json.dump(log, f)


def importlog(fname):
    with open(fname) as f:
        log = json.load(f)
    return log


def printlog(log):
    print json.dumps(log, sort_keys=True, indent=2, separators=(',', ': '))


def checklog(log):
    success = True
    for i in range(len(log)):
        success &= (len(log[i][lk.FROM]) > 0)
    return success


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


def gatherlogs(Loglist):
    totlog = []
    for logfile in Loglist:
        log = importlog(logfile)
        try:
            if totlog[-1][lk.FROM] == log[0][lk.FROM]:
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
    """ Compress a single logfile with a factor"""
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
    print "logs reduced by factor {}".format(factor)
    return newlog


if __name__ == '__main__':
    logdir = sys.argv[1]
    outdir = 'final/'
    outname = 'wc98_log_'
    ext = 'hour.json'
    interval = 0.25

    Logs = createloglist(logdir)
    logs = gatherlogs(Logs)

    path = outdir + outname + str(interval) + ext
    exportlog(logs, path)

    rlog = logs
#    for factor in [4, 8, 24, 48, 96]:
    for rfact, factor in [(4, 4), (2, 8), (3, 24), (2, 48), (2, 96)]:
        path = outdir + outname + str(int(interval*factor)) + ext
        rlog = reducelogs(rlog, rfact)
        exportlog(rlog, path)
