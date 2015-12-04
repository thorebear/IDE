#!/usr/local/bin/python

import numpy as np
from sklearn.decomposition import PCA

# Load csv file
hands     = np.loadtxt('hands.csv', delimiter=',')

# Perform PCA
hands_pca = PCA().fit_transform(hands)
hands_pcs = PCA().fit(hands)

# If there are fewer points than dimensions the PCA will automatically remove some columns. 
# They're not needed, but for completeness I readd them
if hands.shape[0]<hands.shape[1]:
    hands_pca = np.append(hands_pca, np.zeros( (hands.shape[0],hands.shape[1]-hands.shape[0])),axis=1)

# Store PCA
np.savetxt('hands_pca.csv',hands_pca, fmt="%11.8f", delimiter=',')

sigma = np.sqrt(hands_pcs.explained_variance_)

n = 8
synhand = np.zeros((2+2*n,112))
synhand[0] = hands_pcs.mean_
synhand[1,:len(sigma)] = sigma/2

xs = np.zeros((112,40))
for i in range(n):
    xs[i]   =  sigma[i]
    xs[i+n] = -sigma[i]

synhand[2:] = hands_pcs.inverse_transform(xs)[:2*n]

np.savetxt('hands_syn.csv',synhand, fmt="%11.8f", delimiter=',')
