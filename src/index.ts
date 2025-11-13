import dotenv from "dotenv";
dotenv.config();

import { PromptTemplate } from "@langchain/core/prompts";
import {JsonOutputParser} from "@langchain/core/output_parsers";
//import {ChatGroq} from "@langchain/groq";
import {ChatOpenAI} from "@langchain/openai";
import {z} from "zod";


const productSchema= z.object({
    name:z.string(),
    price:z.number(),
    starRating:z.number().min(0).max(5)
});


const messyInput =process.argv.slice(2).join(" ");
if(!messyInput){
    console.error("please provide text as input.");
    process.exit(1);
}



const prompt = new PromptTemplate({
    template: `

    you are a product data extractor.Never include <think>, reasoning thoughts.

    convert the following messy product text into a clean JSON object containing:

    - name: string
    - price: number (in usd)
    - starRating: number between 0 and 5(decimals allowed)

    Return only valid JSON. No comments. No explainations.

    Input:
    {input}
    `
     ,
     inputVariables:["input"],

});


// const groqModel = new ChatGroq({
//     apiKey: process.env.GROQ_API_KEY,
//     model: "qwen/qwen3-32b",
//     temperature: 0
// })

const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-mini",
    temperature: 0
})

const parser =new JsonOutputParser()


async function run(){
    try{
        console.log("Processing...");
        const chain= prompt.pipe(model).pipe(parser);

        const result = await chain.invoke({input:messyInput});
        const validated = productSchema.parse(result);

        console.log("final product json output: ");
        console.log(JSON.stringify(validated,null,2));

    }catch(err: any){
        console.error("error:", err.message);


    }
}

run();



//---------RUN THIS COMMAND TO SEE OUTPUT-----------------------
// node --loader ts-node/esm src/index.ts "$12.99; 4.8 stars! carrying case and cleaning brush include -- EcoSipper Stainless Steel Straw Set GizmoTech Smartwatch - $199.99. ???? heart rate monitor, GPS, water-resistant.EcoBrew Coffee Maker - $89.95 USD ????? noise cancellation SoundWave Pro Headphones with 
// 30-hour battery life $149.99, 4.8 star $299.00! UltraClean Robot Vacuum ???BrightLens 4K Projector approximtely $349, rated 4/5 stars Stainless steel SleekBlend Mixer for $79.99 is quite a steal! 8/10.Our rating for the FitTrack Smart Scale is 3/5. It's just not worth the retail price of $49.99 USD.The TravelLite Backpack's ($59.95) water-resistant 
// fabric performed poorly in our tests, which is why we've dropped the rating to 2."