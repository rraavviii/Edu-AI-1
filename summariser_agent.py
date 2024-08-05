from langchain.chat_models import ChatOpenAI
from langchain.schema import(
    AIMessage,
    HumanMessage,
    SystemMessage
)
from langchain.chains import LLMChain
from langchain import PromptTemplate
from langchain_cohere import ChatCohere

def summarise(querry):

    chat_messages=[
    SystemMessage(content='You are an expert assistant with expertize in summarizing conversation'),
    HumanMessage(content=f'Please provide a short and concise summary of the following conversation:\n TEXT: {querry}')
    ]

    llm=ChatCohere(cohere_api_key='uN5ibO94TwfrXmpKsPQ99w2Yysc9L2EG9rJxwIUc')

    generic_template='''
    Write a summary of the following conversation (separated by new line .):
    querry : `{querry}`
    '''

    prompt=PromptTemplate(
        input_variables=['querry'],
        template=generic_template
    )

    prompt.format(querry=querry)
    complete_prompt=prompt.format(querry=querry)
                              
    llm_chain=LLMChain(llm=llm,prompt=prompt)
    summary=llm_chain.run({'querry':querry})
    return summary

