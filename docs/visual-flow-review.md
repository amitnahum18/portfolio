# Project visual review

Reviewed against public source and existing saved artifacts on 2026-10-09.
The 10 flow diagrams explain source code. They are not screenshots or execution results.
The other seven previews use source images or plots of saved source data.

| Project | Verified preview / flow | Review outcome |
| --- | --- | --- |
| [UFC prediction](https://github.com/amitnahum18/UFC_predict) | Previous fight, last three fights and career history → comparative features → CatBoost | Matches training and inference code; no Kaggle ranking claimed. |
| [RAFI](https://github.com/amitnahum18/Data_Analyst_Agent) | FastAPI query/schema endpoints → read-only DuckDB → results | Depicts implemented tools; does not claim that the planned conversational workflow is connected. |
| [License plate pricing](https://github.com/amitnahum18/car-plate-prediction) | Existing saved SHAP beeswarm | Explains notebook features. Separate team leaderboard result does not establish that this notebook was the winning submission. |
| [Car price](https://github.com/amitnahum18/Car_price_prediction) | Histogram of raw model years in the public training CSV | Each bar counts source records. No currency or evaluation claim is inferred from the chart. |
| [Speech emotion](https://github.com/amitnahum18/speech_emotion) | Trim/normalize audio → 30 MFCC means + StandardScaler after train/test split → Random Forest | Corrected to depict training. Microphone prediction omits training's scaler; this discrepancy is disclosed in the detail page. |
| [Semantic genre matching](https://github.com/amitnahum18/Summary2Genre) | Text and genre labels → pretrained multilingual embeddings → cosine/top-k ranking | Both input text and candidate labels are encoded. No fine-tuning or fabricated scores. |
| [AI/human text](https://github.com/amitnahum18/Web_AI_Humen) | Flask input → saved vectorizer → saved classifier → class | Matches transform/predict code. No authorship-confidence claim. |
| [Baggage X-ray](https://github.com/amitnahum18/Xray_Predict) | Saved YOLO bounding-box output | Baggage screening image, not a medical image. Confidence is not evaluation accuracy. |
| [Military vehicle detection](https://github.com/amitnahum18/Aircract_Classifiction_Draft) | Validation curves from the saved 50-epoch log | Dataset caveats remain visible; no fresh model run. |
| [Vehicle distance](https://github.com/amitnahum18/Autonomous_Vehicle_Course) | OpenCV video → pretrained YOLO boxes → distance from assumed focal length/object height | Approximate distance; no driving control or calibrated distance accuracy. |
| [Simulated irrigation](https://github.com/amitnahum18/IOT_SMART_HOME) | Moisture time series from saved SQLite records | Simulated measurements; no physical pump or water-saving claim. |
| [Travel prompting](https://github.com/amitnahum18/Task_1_For_Jeen) | Existing campaign demo screenshot | Assignment demonstration, not a customer deployment. |
| [Document retrieval](https://github.com/amitnahum18/Task_2_For_Jeen) | Extract/chunk → Gemini embeddings stored in pgvector → separately embedded query / top-k retrieval | Corrected to distinguish document indexing from query-time search. No generated chat answer implied. |
| [Support workflow](https://github.com/amitnahum18/Task_3_For_Jeen) | True/False router → optional read-only SQL analysis → response | Corrected to show the direct response branch when no lookup is needed. Email is a tool available to response agents, not a mandatory step. |
| [ZAPI](https://github.com/amitnahum18/ZAPI) | Wokwi circuit/code context → static checks → OpenRouter request | Checks contribute context to the AI request. No physical validation claimed. |
| [WALL-E UI](https://github.com/amitnahum18/WALL_E) | Wake/phrase activation → speech capture → local transcript | Simplified user-level flow. Phrase mode already uses continuous recognition; Porcupine hands off to recognition. No LLM response stage. |
| [Lyftcode](https://lyftcode.onrender.com/login) | Actual public sign-in screenshot | Authenticated features have not been tested. |

Card previews are deliberately abbreviated; full diagrams and captions appear in
the existing project detail pages. Hebrew diagrams follow right-to-left order;
vertical mobile detail diagrams run top-to-bottom. The support diagram includes
a bypass arrow for requests that do not need database analysis.
