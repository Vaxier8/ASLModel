import mediapipe as mp
import cv2
import numpy as np
import uuid
import os
import re
from csv import writer
import time

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

def getXY(results):
    listo = []
    if results.multi_hand_landmarks:
        for handLms in results.multi_hand_landmarks:
            for id, lm in enumerate(handLms.landmark):
                marks = []
                marks.append(lm.x);
                marks.append(lm.y);
                listo.append(marks)
                
    return listo
            
    #
    # if results.multi_hand_landmarks:
    #     for handLms in results.multi_hand_landmarks:
    #         return enumerate(handLms.landmark)


cap = cv2.VideoCapture(0)
with mp_hands.Hands(min_detection_confidence=0.8, min_tracking_confidence=0.5) as hands: 
    while cap.isOpened():
        ret, frame = cap.read()
        # BGR 2 RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
      
        # Flip on horizontal
        image = cv2.flip(image, 1)
        
        # Set flag
        image.flags.writeable = False
        
        # Detections
        results = hands.process(image)
        
        
        # Set flag to true
        image.flags.writeable = True
        
        # RGB 2 BGR
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        # Detections
        # Rendering results
        if results.multi_hand_landmarks:
            for num, hand in enumerate(results.multi_hand_landmarks):
                mp_drawing.draw_landmarks(image, hand, mp_hands.HAND_CONNECTIONS, 
                                        mp_drawing.DrawingSpec(color=(121, 22, 76), thickness=2, circle_radius=4),
                                        mp_drawing.DrawingSpec(color=(250, 44, 250), thickness=2, circle_radius=2),
                                         )
            
        # Save our image  
        time.sleep(.002)
        listo = ["BACKSPACE", getXY(results)]
        print(listo)
        
        with open('train.csv', 'a') as f_object:
            writer_object = writer(f_object)
            writer_object.writerow(listo)
            f_object.close()
        
         
         


        if cv2.waitKey(10) & 0xFF == ord('q'):
            break


cap.release()
cv2.destroyAllWindows()
