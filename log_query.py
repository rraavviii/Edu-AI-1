# import sys
# import json
# from pymongo import MongoClient
# from bson.objectid import ObjectId
# from summariser_agent import summarise

# def log_query_id(query_id):
#     client = MongoClient('mongodb://127.0.0.1:27017/edutech')

#     db = client['edutech']

#     collection = db['replies']
#     query_id = ObjectId(query_id)  
#     documents = collection.find({'querry': query_id})
#     results = [doc.get('replycontent', 'No content') for doc in documents]
#     summ = summarise(results)
#     print(summ)

# if __name__ == "__main__":
#     query_id = sys.argv[1]
#     log_query_id(query_id)



import sys
import json
from pymongo import MongoClient
from bson.objectid import ObjectId
from summariser_agent import summarise

def log_query_id(query_id):
    client = MongoClient('mongodb://127.0.0.1:27017/edutech')

    db = client['edutech']
    collection = db['replies']
    query_id = ObjectId(query_id)
    
    documents = collection.find({'querry': query_id})
    results = [doc.get('replycontent', 'No content') for doc in documents]
    summ = summarise(results)
    
   
    db['infos'].update_one(
        {'_id': query_id},
        {'$set': {'summary': summ}}
    )
    print(summ)

if __name__ == "__main__":
    query_id = sys.argv[1]
    log_query_id(query_id)

