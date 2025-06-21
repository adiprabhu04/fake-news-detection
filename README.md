# 📰 Fake News Detection & Explainability

A complete pipeline to classify news articles as **real** or **fake**, combining both traditional ML and deep learning, with built-in model explainability using SHAP and LIME.

---

## 📁 Project Structure

```
fake-news-detection/
├── data/
│   ├── True.csv              # Real news articles
│   └── Fake.csv              # Fake news articles
├── fake_news_classifier/     # (Optional) Pretrained transformer files or model artifacts
├── final-project.ipynb       # Jupyter Notebook with full pipeline
├── download_nltk.py          # Helper to download NLTK data
├── README.md                 # You’re reading it
```

---

## 📦 Dataset

This project uses the [Fake and Real News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset) from Kaggle.

After downloading, place the files in a folder named `data/` as shown above.

---

## 🧠 Pipeline Overview

1. **Data Loading & Labeling**  
   - Load `True.csv` and `Fake.csv`  
   - Combine into a single DataFrame with `label` column  

2. **Preprocessing**  
   - Clean text: lowercase, remove punctuation  
   - Tokenization:  
     - **For ML**: NLTK tokenization, stopword removal, stemming  
     - **For LSTM**: Keras Tokenizer + `pad_sequences`  

3. **Feature Extraction & Modeling**  
   - **Traditional ML**:  
     - TF-IDF Vectorizer →  
       - Logistic Regression  
       - Multinomial Naive Bayes  
       - Random Forest  
     - **Explainability**:  
       - SHAP for global feature importance  
       - LIME for local text explanations  
   - **Deep Learning**:  
     - Sequential model with:  
       ```  
       Embedding → LSTM → Dense (sigmoid)  
       ```  
     - Trained on padded sequences  

4. **Evaluation & Visualization**  
   - Accuracy & classification reports for all models  
   - Confusion matrices (ML & LSTM)  
   - Training curves (loss & accuracy) for LSTM  
   - SHAP plots (bar & beeswarm)  
   - LIME explanation snapshots  

---

## 🚀 Quick Start

1. **Install dependencies**  
   ```bash
   pip install pandas scikit-learn nltk matplotlib seaborn tensorflow shap lime
   ```

2. **Download NLTK resources**  
   ```bash
   python download_nltk.py
   ```

3. **Download Pretrained Model**  
   [Download fake_news_classifier.zip](https://drive.google.com/file/d/1fjHVPgsgWuSDuHoIL4-iQLJvLGIfqcCY/view)

   - Unzip the file
   - Place the folder `fake_news_classifier/` in the root project directory

4. **Launch & run the notebook**  
   ```bash
   jupyter notebook final-project.ipynb
   ```

5. **Follow the notebook cells** for data prep, training, evaluation, and explainability.

---

## 📊 Sample Results

| Model               | Accuracy |
|---------------------|----------|
| Logistic Regression | 95.2%    |
| Naive Bayes         | 93.8%    |
| Random Forest       | 96.1%    |
| LSTM                | 97.4%    |

---

## 💡 Future Enhancements

- Incorporate transformer-based models (BERT, DistilBERT)  
- Deploy a web demo using Streamlit or FastAPI  
- Add more explainability techniques (e.g., Integrated Gradients)  
- Expand to multilingual fake-news detection  

---

## ✍️ Author

Built by [Aditya Prabhudessai](https://github.com/adiprabhu04)  
Making news truth-checking smarter, one line of code at a time 🚀