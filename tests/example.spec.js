// @ts-check
import { test, expect } from '@playwright/test';
import {chromium } from "playwright" 
/* import fs from "fs" 
import randomUUID from "crypto" */ 
import {OpenRouter } from "@openrouter/sdk" 
import dotenv from "dotenv" 
/* import { off } from 'cluster' ; */ 

dotenv.config() 

let browser, context, page, screenshotPayload 

async function openBrowser() 
{ 
  try 
  { 
    browser= await chromium.launch({headless: true } ) ; 
    context= await browser.newContext() ; 
    page= await browser.newPage() ; 

    return ({status: "Successful", message: "Browser Opened Successfully " } ) 
  } catch (error ) 
  { 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function navigateToUrl(page, url ) 
{ 
  try 
  { 
    await page.goto(url ) 
    return ({status: "Successful", message: `Navigated to URL ${url } Successfully ` } ) 
  } catch (error ) 
  { 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function takeScreenshot(page ) 
{ 
  try 
  { 
    const screenshot= await page.screenshot() 

    screenshotPayload= `data:image/png;base64,${screenshot.toString("base64")}` 

    return {"status": "Successful" } 
  } catch (error ) 
  { 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

/* async function readScreenshot() 
{ 
  try 
  { 
    if(screenshotPayload ) 
    { 
      let res= ({status: "Successful", message: screenshotPayload } ) 
      screenshotPayload= undefined 
      return res 
    } 
    else 
    { 
      throw new Error("No Screenshot is Available " ) 
    } 
  } catch (error ) 
  { 
    return ({status: "Fail", message: error.message } ) 
  } 
} */ 

async function scroll(page, direction, amount ) 
{ 
  try { 
    
    if(direction== "down" ) 
    { 
      page.mouse.wheel(0, amount ) 
    } 
    else if(direction== "up" ) 
    { 
      page.mouse.wheel(0, -amount ) 
    } 
    else if(direction== "right" ) 
    { 
      page.mouse.wheel(amount, 0 ) 
    } 
    else if(direction== "left" ) 
    { 
      page.mouse.wheel(-amount, 0 ) 
    } 

    console.log("Scrolled Page Here" ) 
    
    return ({status: "Successful", message: `Scrolled ${direction } by ${amount } pixels Successfully ` } ) 
  } catch (error ) 
  { 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function getFormCoordinatesByLabel(page, label ) 
{ 
  try 
  { 
    const elm= await page.getByLabel(label ) 
    const box= await elm.boundingBox() 
    console.log("Coordinates are "+ box.x+ " "+ box.y ) 
    return ({status: "Successful", message: `${box.x },${box.y }` } ) 
  } catch (error ) 
  { 
    return ({status: "Fail", message: error.messge } ) 
  } 
} 

async function clickOnScreen(page, x, y ) 
{ 
  try 
  { 
    await page.mouse.click(x, y ) 
    console.log("Clicked on Screen at Coordinates "+ x+ " "+ y ) 
    return ({status: "Successful", message: `Clicked on Screen at coordinates (${x }, ${y } ), Successfully ` } ) 
  } catch (error ) 
  { 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function doubleClick(page, x, y ) 
{ 
  try 
  { 
    await page.mouse.dblclick(x, y ) 
    return ({status: "Successful", message: `Double Clicked on Screen at Coordinates (${x }, ${y } ), Successfully ` } ) 
  } catch (error ) 
  { 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function sendKeys(page, keys ) 
{ 
  try 
  { 
    await page.keyboard.type(keys ) 
    return ({status: "Successful", message: "Sent keys "+ keys+ " Successfully " } ) 
  } catch (error ) 
  { 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

function safeParseJSON(raw ) 
{ 
  let cleaned= raw.trim() 

  cleaned= cleaned.replace(/^```json\s*/i,"" ).replace(/^```\s*/i,"" ).replace(/```\s*$/i,"" ) 

  const firstBracket= cleaned.indexOf('{' ) 

  let depth= 0, end= -1 

  for(let i= firstBracket ; i< cleaned.length ; ++i ) 
  { 
    if(cleaned[i]== '{' ) 
    { 
      depth++ ; 
    } 
    else if(cleaned[i]== '}' ) 
    { 
      depth-- ; 
    } 
    if(depth== 0 ) 
    { 
      end= i ; 
      break ; 
    } 
  } 

  const jsonStr= cleaned.slice(firstBracket, (end+ 1 ) ) 

  const jsonObject= JSON.parse(jsonStr ) 

  return jsonObject 
} 

test("fill form ", async()=> 
{ 
    const client= new OpenRouter( 
      { 
        apiKey: process.env.OPENROUTER_API_KEY 
      } 
    ) 
    /* const system_prompt= 
    `You are a helpful Browser Automation Tool called Playwright. You are similar to the actual Playwright browser automation tool. 
    Your task is to take users query as an input, take actions with the set of tools provided to you sequentially step by step, and complete the task. 
    
    OUTPUT Format: 
    {step: INPUT | THINK | ACTION | RESULT | END, tool_name: (name of the tool ), tool_args: (arguments for the tool in JSON format ), inlineData: (Image metadata object with mimetype and Image Buffer String), observation: (input query observation | next step to be taken based on previous steps and execution | result of the execution of the tool ) } 
    
    RULES: 
    
    1. You must return the response strictly in JSON Format. 
    
    2. You must THINK and perform the ACTION in step by step manner based on previous steps and actions always before taking the next step or providing the final observation. 

    3. You must not repeat an ACTION again if it yeilds a Successful message. 

    4. You must wait for the ACTION step to yeild a RESULT before moving forward with any step. 

    5. You must not try to batch multiple tool calls in a single ACTION step. Call them one by one THINK-> ACTION-> RESULT, and then call the next important ACTION. 
    
    TOOLS: 
    
    You have access to the following tools: 
    
    1. openBrowser()-> This tool opens a new Browser Instance and a new page Instance. It takes no arguments, and return a success message if the browser is opened successfully, otherwise it returns an error message. 
    
    2. navigateToUrl(url: string )-> This tool takes a URL as an argument, and navigates to that URL in the opened Browser. It returns a success message if the Navigation is successfull, otherwise it returns an error message. 
    
    3. takeScreenshot()-> This tool takes a screenshot of the current page in the opened Browser. It takes no arguments, and returns a success message if the screenshot is taken successfully, otherwise it returns an error message. 
    
    4. scroll(amount: number )-> This tool scrolls the current page downwards in the opened Browser by the specified amount of pixels. It takes a number as an argument, and returns a success message if the scrolling is successful, otherwise it returns an error message. 
    
    5. getFormCoordinatesByLabel(label: string )-> This tool takes a label as an argument, and returns the coordinates of the form element with that label in the opened Browser. It returns a success message if the coordinates are found successfully, otherwise it returns an error message. 
    
    6. clickOnScreen(x: number, y: number )-> This tool takes x and y coordinates as arguments, and clicks on the screen at those coordinates in the opened Browser. It returns a success message if the click is successful, otherwise it returns an error message. 
    
    7. doubleClick(x: number, y: number )-> This tool takes x and y coordinates as arguments, and double clicks on the screen at those coordinates in the opened Browser. It returns a success message if the double click is successful, otherwise it returns an error message. 
    
    8. sendKeys(keys: string )-> This tool takes a string of keys as an argument, and enters those keys to the current page in the opened Browser. It returns a success message if the keys are sent successfully, otherwise it returns an error message. 
    
    EXAMPLE: 
    
    user: "Please navigate to https://ui.shadcn.com/docs/forms/react-hook-form, identify the form elements with Labels "Username" and "More about you", and fill them with some data automatically. 
    
    assistant: {step: "INPUT", observation: "User wants me to navigate to https://ui.shadcn.com/docs/forms/react-hook-form, identify the form elements with Labels 'Username' and 'More about you', and fill them with some data automatically." } 
    
    assistant: {step: "THINK", observation: "First, I need to open the Browser. Do I have any tools available to open the Browser?" } 
    
    assistant: {step: "THINK", observation: "Yes, I have a tool called openBrowser() which can open a new Browser Instance and a new page Instance. I will use this tool to the open the Browser." } 
    
    assistant: {step: "ACTION", tool_name: "openBrowser", tool_args: {} } 

    assistant: {step: "RESULT", observation: "Browser opened Successfully." } 
    
    assissstant: {step: "THINK", observation: "The Browser is opened successfully. Now, I need to navigate to the URL https://ui.shadcn.com/docs/forms/react-hook-form." } 
    
    assistant: {step: "THINK", observation: "I have tool called navigateToUrl() which can navigate to a the given URL in the opened Browser." } 
    
    assistant: {step: "ACTION", tool_name: "navigateToUrl", tool_args: {"url": "https://ui.shadcn.com/docs/forms/react-hook-form" } } 
    
    assistant: {step: "RESULT", observation: "Navigated to URL https://ui.shadcn.com/docs/forms/react-hook-form Successfully." } 
    
    assistant: {step: "THINK", observation: "Now, I need to identify the form elements with Labels 'Username' and 'More about you'." } 
    
    assistant: {step: "THINK", observation: "I nned to check if the current page has any of the form elements I need." } 
    
    assistant: {step: "ACTION", tool_name: "takeScreenshot", tool_args: {} } 
    
    assistant: {step: "RESULT", observation: "Fields on the current page are Email and Password." } 
    
    assistant: {step: "THINK", observation: "I could not find any form Elements with Labels 'Username' and 'More about you' in the current page. I need to scroll down the page to find the form elements." } 
    
    assistant: {step: "THINK", observation: "I have a tool called scroll() which can scroll the current page downwards in the opened Browser by the specified amount of pixels," } 
    
    assistant: {step: "ACTION", tool_name: "scroll", tool_args: {"amount": 500 } } 
    
    assistant: {step: "RESULT", observation: "Scrolled down the page by 500 pixels Successfully." } 
    
    assistant: {step: "THINK", observation: "I will take another screenshot of the current page to check if the form elements are available now." } 
    
    assistant: {step: "ACTION", tool_name: "takeScreenshot", tool_args: {} } 
    
    assistant: {step: "RESULT", observation: "Fields on the current page are Username, address and posts." } 
    
    assistant: {step: "THINK", observation: "I have found the form element with label 'Username' in the current page. Now, I need to get the coordinates of this label. } 
    
    assistant: {step: "THINK", observation: "I have a tool called getFormCoordinatesByLabel() which can get the coordinates of the form element with the given label." } 
    
    assistant: {step: "ACTION", tool_name: "getFormCoordinatesByLabel", tool_args: {"label": "Username" } } 
    
    assistant: {step: "RESULT", observation: "(20,50)" } 
    
    assistant: {step: "THINK", observation: "I have got the coordinates of the form element with label 'Username'. Now, I need to click on the screen at these coordinates to focus on the input field." } 
    
    assistant: {step: "THINK", observation: "I can use the tool clickOnScreen() to click on the screen at the given coordinates." } 
    
    assistant: {step: "ACTION", tool_name: "clickOnScreen", tool_args: {"x": 20, "y", 50 } } 
    
    assistant: {step: "RESULT", observation: "Clicked on Screen at Coordinates (20, 50 ) Successfully." } 
    
    assistant: {step: "THINK", observation: "Now, I need to send some keys to the input field to fill the form element with label 'Username'." } 
    
    assistant: {step: "THINK", observation: "I have a tool called sendKeys() which can send the given keys to the Current page in the Browser. I will enter 'Krisshank' into the input field." } 
    
    assistant: {step: "ACTION", tool_name: "sendKeys", tool_args: {"keys": "Krisshank" } } 
    
    assistant: {step: "RESULT", observation: "Sent keys 'Krisshank' Successfully." } 
    
    assistant: {step: "THINK", observation: "Now, I need to identify the form element with label 'More about you'." } 
    
    assistant: {step: "THINK", observation: "I will need to scroll down to find the form element with the needed label." } 
    
    assistant: {step: "ACTION", tool_name: "scroll", tool_args: {"amount": 500 } } 
    
    assistant: {step: "RESULT", observation: "Scrolled down the page by 500 pixels Successfully." } 
    
    assistant: {step: "THINK", observation: "I need to take a screenshot of the Current page to see if the form element with label 'More about you' is available now." } 
    
    assistant: {step: "ACTION", tool_name: "takeScreenshot", tool_args: {} } 
    
    assistant: {step: "RESULT", observation: "Fields on the current page are More about you and stories." } 
    
    assistant: {step: "THINK", observation: "I have found the form element with label 'More about you'. Now, I need to get the coordinates of this label." } 
    
    assistant: {step: "ACTION", tool_name: "getFormCoordinatesByLabel", tool_args: {"label": "More about you" } } 
    
    assistant: {step: "RESULT", observation: "(60,150)" } 
    
    assistant: {step: "THINK", observation: "I have got the coordinates of the form element with label 'More about you'. Now, I need to click on the screen at these coordinates to focus on the input field." } 
    
    assistant: {step: "ACTION", tool_name: "clickOnScreen", tool_args: {"x": 60, "y": 150 } } 
    
    assistant: {step: "RESULT", observation: "Clicked on Screen at Coordinates (60, 150 ) Successfully." } 
    
    assistant: {step: "THINK", observation: "Now, I need to fill the input field with some data. I will enter 'Hello Friends I am A student at Scaler School of Technology, I am currently studying and pursuing Computer Science, and Learning about new Things, Thank you very much.'" } 
    
    assistant: {step: "ACTION", tool_name: "sendKeys", tool_args: {"keys": "Hello Friends I am A student at Scaler School of Technology, I am currently studying and pursuing Computer Science, and Learning about new Things, Thank you very much." } } 
    
    assistant: {step: "RESULT", observation: "Sent keys 'Hello Friends I am A student at Scaler School of Technology, I am currently studying and pursuing Computer Science, and Learning about new Things, Thank you very much.' Successfully." } 
    
    assistant: {step: "THINK", observation: "I have filled the form elements with labels 'Username' and 'More about you' successfully. I have completed the task as per the user's request, and end the session here." } 
    
    assistant: {step: "END" } ` */ 

    const system_prompt= 
    `You are a helpful Browser Automation Agent called Playwright. You behave like the real Playwright browser automation library, controlled step by step via a fixed set of tools.

  Your task: take the user's query as input, then reason and act through a strict sequential loop — THINK, then ACTION (one tool call), then wait for RESULT — until the task is complete, then emit END.

  ============================
  OUTPUT FORMAT (MANDATORY)
  ============================
  You must respond with EXACTLY ONE valid JSON object per turn — no markdown, no code fences, no extra text before or after.

  Schema:
  {
    "step": "INPUT" | "THINK" | "ACTION" | "RESULT" | "END",
    "tool_name": "<tool name, only when step is ACTION>",
    "tool_args": { "<arg>": "<value>" },
    "observation": "<reasoning, result interpretation, or summary>"
  }

  - All keys and string values must use double quotes.
  - Omit "tool_name" and "tool_args" entirely when step is not "ACTION".
  - Never output multiple JSON objects, arrays, or commentary in a single response.
  - Never wrap output in Backticks json or any code block. 

  ============================
  STRICT RULES
  ============================
  1. Output must be valid JSON, parsable by JSON.parse(), every single turn.
  2. Follow this cycle without skipping or merging steps:
    INPUT (once, at start) → THINK → ACTION → RESULT → THINK → ACTION → RESULT → ... → END
  3. Each ACTION step must call exactly ONE tool with valid arguments matching the tool's signature.
  4. After every ACTION, you will receive a RESULT message from the system. You must read it carefully before deciding the next THINK.
  5. Never repeat an ACTION that already returned a success RESULT for the same goal (e.g., do not call openBrowser twice, do not navigate to the same URL twice, do not re-click a field you already filled).
  6. If a RESULT indicates an error, THINK about the cause and try an alternative approach (different label text, more scrolling, re-checking coordinates) — do not blindly retry the identical action.
  7. Use takeScreenshot() whenever you need to verify the current page state, especially after navigation, scrolling, or before deciding coordinates for a new field.
  8. Only call getFormCoordinatesByLabel() for a label you have visually confirmed exists on the current page (via a screenshot RESULT).
  9. Before sendKeys(), you must have already clicked on the target field's coordinates in the immediately preceding successful ACTION.
  10. Once all requested fields are filled and confirmed (via a final screenshot if needed), emit a final THINK summarizing completion, then emit {"step": "END"} and stop. Do not call any tool after END.
  11. If a task cannot be completed after reasonable attempts (e.g., label never found after 3 scroll+screenshot cycles), THINK to explain the issue, then emit END with an observation describing what was and wasn't completed. 

  ============================
  CRITICAL: 
  ============================
  
  Output ONE single JSON object only. Do not output multiple JSON objects in one response. Do not add any text, explanation, or markdown formatting before or after the JSON object. 
  Your entire response must be parsable by JSON.parse() with no modification.

  ============================
  TOOLS
  ============================
  1. openBrowser() — Opens a new browser instance and page. No args. Returns success/error message.
  2. navigateToUrl(url: string) — Navigates the current page to the given URL. Returns success/error message.
  3. takeScreenshot() — Captures the current page state. No args. Returns a description of visible fields/labels.
  4. scroll(amount: number) — Scrolls the page down by the given pixel amount. Returns success/error message.
  5. getFormCoordinatesByLabel(label: string) — Returns the (x, y) coordinates of the form element associated with the given label, if visible. Returns success/error message.
  6. clickOnScreen(x: number, y: number) — Clicks at the given screen coordinates. Returns success/error message.
  7. doubleClick(x: number, y: number) — Double-clicks at the given screen coordinates. Returns success/error message.
  8. sendKeys(keys: string) — Types the given string into the currently focused element. Returns success/error message.

  ============================
  EXAMPLE
  ============================
  user: "Navigate to https://ui.shadcn.com/docs/forms/react-hook-form, identify the form elements with labels 'Username' and 'More about you', and fill them with sample data."

  assistant: {"step": "INPUT", "observation": "User wants me to navigate to the given URL, find form fields labeled 'Username' and 'More about you', and fill both with sample data."}

  assistant: {"step": "THINK", "observation": "First I need to open a browser instance using openBrowser()."}

  assistant: {"step": "ACTION", "tool_name": "openBrowser", "tool_args": {}, "observation": "Opening a new browser instance."}

  assistant: {"step": "RESULT", "observation": "Browser opened successfully."}

  assistant: {"step": "THINK", "observation": "Browser is ready. Next, navigate to the target URL using navigateToUrl()."}

  assistant: {"step": "ACTION", "tool_name": "navigateToUrl", "tool_args": {"url": "https://ui.shadcn.com/docs/forms/react-hook-form"}, "observation": "Navigating to the target page."}

  assistant: {"step": "RESULT", "observation": "Navigated successfully."}

  assistant: {"step": "THINK", "observation": "I need to check what fields are currently visible before searching for 'Username' or 'More about you'. I'll take a screenshot."}

  assistant: {"step": "ACTION", "tool_name": "takeScreenshot", "tool_args": {}, "observation": "Capturing current page state."}

  assistant: {"step": "RESULT", "observation": "Visible fields: Email, Password."}

  assistant: {"step": "THINK", "observation": "Neither target field is visible. I'll scroll down to reveal more of the form."}

  assistant: {"step": "ACTION", "tool_name": "scroll", "tool_args": {"amount": 500}, "observation": "Scrolling down to find the target fields."}

  assistant: {"step": "RESULT", "observation": "Scrolled down by 500 pixels."}

  assistant: {"step": "THINK", "observation": "I'll take another screenshot to check if 'Username' is now visible."}

  assistant: {"step": "ACTION", "tool_name": "takeScreenshot", "tool_args": {}, "observation": "Capturing current page state after scrolling."}

  assistant: {"step": "RESULT", "observation": "Visible fields: Username, Address, Posts."}

  assistant: {"step": "THINK", "observation": Found one of the fields, 'Username'. It is now visible, I'll get its coordinates using getFormCoordinatesByLabel()."}

  assistant: {"step": "ACTION", "tool_name": "getFormCoordinatesByLabel", "tool_args": {"label": "Username"}, "observation": "Locating the Username field."}

  assistant: {"step": "RESULT", "observation": "Coordinates found: (20, 50)."}

  assistant: {"step": "THINK", "observation": "I'll click on (20, 50) to focus the Username field."}

  assistant: {"step": "ACTION", "tool_name": "clickOnScreen", "tool_args": {"x": 20, "y": 50}, "observation": "Clicking on the Username field."}

  assistant: {"step": "RESULT", "observation": "Clicked successfully."}

  assistant: {"step": "THINK", "observation": "The Username field is focused. I'll type sample text into it."}

  assistant: {"step": "ACTION", "tool_name": "sendKeys", "tool_args": {"keys": "Krisshank"}, "observation": "Typing sample username."}

  assistant: {"step": "RESULT", "observation": "Keys sent successfully."}

  assistant: {"step": "THINK", "observation": "'Username' is done. Now I need to find 'More about you'. I'll scroll down further."}

  assistant: {"step": "ACTION", "tool_name": "scroll", "tool_args": {"amount": 500}, "observation": "Scrolling down to find 'More about you'."}

  assistant: {"step": "RESULT", "observation": "Scrolled down by 500 pixels."}

  assistant: {"step": "THINK", "observation": "I'll take a screenshot to confirm 'More about you' is now visible."}

  assistant: {"step": "ACTION", "tool_name": "takeScreenshot", "tool_args": {}, "observation": "Capturing current page state after scrolling."}

  assistant: {"step": "RESULT", "observation": "Visible fields: More about you, Stories."}

  assistant: {"step": "THINK", "observation": "Found another field, 'More about you'. It is visible, I'll get its coordinates."} 

  assistant: {"step": "ACTION", "tool_name": "getFormCoordinatesByLabel", "tool_args": {"label": "More about you"}, "observation": "Locating the 'More about you' field."}

  assistant: {"step": "RESULT", "observation": "Coordinates found: (60, 150)."}

  assistant: {"step": "THINK", "observation": "I'll click on (60, 150) to focus this field."}

  assistant: {"step": "ACTION", "tool_name": "clickOnScreen", "tool_args": {"x": 60, "y": 150}, "observation": "Clicking on the 'More about you' field."}

  assistant: {"step": "RESULT", "observation": "Clicked successfully."}

  assistant: {"step": "THINK", "observation": "The field is focused. I'll type sample descriptive text into it."}

  assistant: {"step": "ACTION", "tool_name": "sendKeys", "tool_args": {"keys": "Hello, I am a student studying Computer Science and learning new technologies every day."}, "observation": "Typing sample description."}

  assistant: {"step": "RESULT", "observation": "Keys sent successfully."}

  assistant: {"step": "THINK", "observation": "Both 'Username' and 'More about you' fields have been filled successfully. The task is complete."}

  assistant: {"step": "END", "observation": "Task completed: both fields were located and filled successfully."} ` 

    const userQuery= `Navigate to: https://ui.shadcn.com/docs/forms/react-hook-form
    Identify the form elements on the page (Username and Description fields)
    Automatically fill in the Username and Description. ` 

    let messages= [{role: "system", content: system_prompt }, {role: "user", content: userQuery } ] 

    async function main() 
    { 
      while(true ) 
      { 
        console.log(messages[(messages.length- 1 ) ] ) 
        const response= await client.chat.send({ 
          chatRequest: 
          { 
            model: "deepseek/deepseek-r1", 
            //@ts-ignore 
            messages: messages, 
            temperature: 0.02, 
            stream: false, 
            responseFormat: {type: "json_object" } 
          } 
        } ) 
        console.log("Raw Response Here "+ response.choices[0].message.content ) 
        let res= safeParseJSON(response.choices[0].message.content ) 
        console.log(res ) 
        if(res.step== "INPUT" ) 
        { 
          messages.push({role: "assistant", content: JSON.stringify(res ) } ) 
        } 
        else if(res.step== "THINK" ) 
        { 
          messages.push({role: "assistant", content: JSON.stringify(res ) } ) 
        } 
        else if(res.step== "ACTION" ) 
        { 
          if(res.tool_name== "openBrowser" ) 
          { 
            const result= await openBrowser() 
            console.log(result ) 
            messages.push({role: "assistant", content: JSON.stringify({step: "RESULT", observation: result.message } ) } ) 
          } 
          else if(res.tool_name== "navigateToUrl" ) 
          { 
            const result= await navigateToUrl(page, res.tool_args.url ) 
            messages.push({role: "assistant", content: JSON.stringify({step: "RESULT", observation: result.message } ) } ) 
          } 
          else if(res.tool_name== "takeScreenshot" ) 
          { 
            const result= await takeScreenshot(page ) 
            let resultMessage 
            if(result.status== "Successful" ) 
            { 
              const imageChat= await client.chat.send({ 
                chatRequest: 
                { 
                  model: "openai/gpt-4o-mini", 
                  messages: [{ 
                    role: "user", 
                    content: [{ 
                      type: "text", 
                      text: "Only name the Form fields and labels visible on the viewport of this Web Browser Page that can be accessed by the page.getByLabel(name) Locator Function of the Playwright Browser Automation Tool, in Plain Text." 
                    }, { 
                      type: "image_url", 
                      imageUrl: { 
                        url: screenshotPayload, 
                        detail: "high" 
                      } 
                    } ] 
                  } ], 
                  temperature: 0.05, 
                  stream: false, 
                } 
              } ) 
              resultMessage= JSON.stringify({step: "RESULT", observation: imageChat.choices[0].message.content } ) 
            } 
            else 
            { 
              resultMessage= JSON.stringify({step: "RESULT", observation: result.message } ) 
            } 
            console.log(resultMessage ) 
            messages.push({role: "assistant", content: resultMessage } ) 
          } 
          else if(res.tool_name== "scroll" ) 
          { 
            const result= await scroll(page, "down", res.tool_args.amount ) 
            messages.push({role: "assistant", content: JSON.stringify({step: "RESULT", observation: result.message } ) } ) 
          } 
          else 
          { 
            let result= {message: "Invalid Tool Name " } 
            if(res.tool_name== "getFormCoordinatesByLabel" ) 
            { 
              result= await getFormCoordinatesByLabel(page, res.tool_args.label ) 
            } 
            else if(res.tool_name== "clickOnScreen" ) 
            { 
              result= await clickOnScreen(page, res.tool_args.x, res.tool_args.y ) 
            } 
            else if(res.tool_name== "doubleClick" ) 
            { 
              result= await doubleClick(page, res.tool_args.x, res.tool_args.y ) 
            } 
            else if(res.tool_name== "sendKeys" ) 
            { 
              result= await sendKeys(page, res.tool_args.keys ) 
            } 
            messages.push({role: "assistant", content: JSON.stringify({step: "RESULT", observation: result.message } ) } ) 
          } 
        } 
        else if(res.step== "RESULT" ) 
        { 
          messages.push({role: "assistant", content: JSON.stringify(res ) } ) 
        } 
        else if(res.step== "END" ) 
        { 
          break ; 
        } 
      } 
    } 

    await main() 
} ) 
