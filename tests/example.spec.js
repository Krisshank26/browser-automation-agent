// @ts-check
import { test, expect } from '@playwright/test';
import {chromium } from "playwright" 
/* import fs from "fs" */ 
import randomUUID from "crypto" 
import {OpenRouter } from "@openrouter/sdk" 
import dotenv from "dotenv" 
import { off } from 'cluster';

dotenv.config() 

/* test('get started link', async ({ page }) => { 
  await page.goto('https://playwright.dev/' ) ; 

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible() ; 
} ) ; */ 

let browser, context, page, screenshotPayload 
/* const path= fs.openSync("logs/tests.log", "w" ) */ 

async function openBrowser() 
{ 
  try 
  { 
    browser= await chromium.launch({headless: true } ) ; 
    context= await browser.newContext() ; 
    page= await browser.newPage() ; 

    // fs.writeFileSync(path, "Browser Opened Successfully " ) 

    return ({status: "Successful", message: "Browser Opened Successfully " } ) 
  } catch (error ) 
  { 
    // fs.writeFileSync(path, "Failed to Open Browser- Error: "+ error.message ) 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function navigateToUrl(page, url ) 
{ 
  try 
  { 
    await page.goto(url ) 
    // fs.writeFileSync("./logs/tests.log", "Navigated to URL "+ url+ " Successfully " ) 
    return ({status: "Successful", message: `Navigated to URL ${url } Successfully ` } ) 
  } catch (error ) 
  { 
    // fs.writeFileSync("./logs/tests.log", `Failed to Navigate to URL ${url }- Error: ${error.message } ` ) 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function takeScreenshot(page ) 
{ 
  try 
  { 
    const id= randomUUID.randomUUID().slice(0, 8 ) 

    const screenshot= await page.screenshot({fullPage: true } ) 

    screenshotPayload= `data:image/png;base64,${screenshot.toString("base64" ) }` 
    
    // fs.writeFileSync('logs/screenshot/screenshot_'+ id+ '.png', screenshot ) 
    // fs.writeFileSync(path, "Screenshot Taken Successfully" ) 

    return {"status": "Successful" } 
  } catch (error ) 
  { 
    // fs.writeFileSync(path, "Screenshot Failed- Error: "+ error.message ) 
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

    // fs.writeFileSync(path, `Scrolled ${direction } by ${amount } pixels, Successfully ` ) 

    console.log("Scrolled Page Here" ) 
    
    return ({status: "Successful", message: `Scrolled ${direction } by ${amount } pixels Successfully ` } ) 
  } catch (error ) 
  { 
    // fs.writeFileSync(path, `Failed to Scroll: Error- ${error.message } ` ) 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function getFormCoordinatesByLabel(page, label ) 
{ 
  try 
  { 
    const elm= await page.getByLabel(label ) 
    const box= await elm.boundingBox() 
    /* await element.scrollIntoViewIfNeeded() 
    const box= await element.boundingBox() */ 
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
    // fs.writeFileSync(path, `Clicked on Screen at Coordinates (${x }, ${y } ), Successfully ` ) 
    console.log("Clicked on Screen at Coordinates "+ x+ " "+ y ) 
    return ({status: "Successful", message: `Clicked on Screen at coordinates (${x }, ${y } ), Successfully ` } ) 
  } catch (error ) 
  { 
    // fs.writeFileSync(path, `Failed to Click on Screen at Coordinates (${x }, ${y } )- Error: ${error.message } ` ) 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function doubleClick(page, x, y ) 
{ 
  try 
  { 
    await page.mouse.dblclick(x, y ) 
    // fs.writeFileSync(path, `Double Clicked on Screen at Coordinates (${x }, ${y } ), Successfully ` ) 
    return ({status: "Successful", message: `Double Clicked on Screen at Coordinates (${x }, ${y } ), Successfully ` } ) 
  } catch (error ) 
  { 
    // fs.writeFileSync(path, `Failed to Double Click on Screen at Coordinates (${x }, ${y } )- Error: ${error.message } ` ) 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

async function sendKeys(page, keys ) 
{ 
  try 
  { 
    await page.keyboard.type(keys ) 
    // fs.writeFileSync(path, `Type Keys ${keys }, Successfully ` ) 
    return ({status: "Successful", message: "Sent keys "+ keys+ " Successfully " } ) 
  } catch (error ) 
  { 
    // fs.writeFileSync(path, `Failed to Type Keys ${keys }- Error: ${error.message } ` ) 
    return ({status: "Fail", message: error.message } ) 
  } 
} 

test("fill form ", async()=> 
{ 
    /* let result= await openBrowser() ; 
    console.log(result ) 

    if(result.status= "Successful" ) 
    { 
      result= await navigateToUrl(page, "https://ui.shadcn.com/docs/forms/react-hook-form" ) 
      console.log(result ) 
      await scroll(page, "down", 800 ) 
      result= await getFormCoordinatesByLabel(page, "Username" ) 
      while(result.status!= "Successful" ) 
      { 
        await scroll(page, "down", 500 ) 
        result= await getFormCoordinatesByLabel(page, "Username" ) 
      } 
      console.log(result ) 
      if(result.status== "Successful" ) 
      { 
        let coordinates= result.message.split("," ).map(Number ) 
        result= await clickOnScreen(page, coordinates[0], coordinates[1] ) 
        await sendKeys(page, "Krisshank" ) 
      } 
    } */ 
    
    /* const googleAI= new GoogleGenAI( 
      { 
        apiKey: process.env.GOOGLE_GEMINI_API_KEY 
      } 
    ) */ 
    const client= new OpenRouter( 
      { 
        apiKey: process.env.OPENROUTER_API_KEY 
      } 
    ) 
    const system_prompt= 
    `You are a helpful Browser Automation Tool called Playwright. You are similar to the actual Playwright browser automation tool. 
    Your task is to take users query as an input, take actions with the set of tools provided to you sequentially step by step, and complete the task. 
    
    OUTPUT Format: 
    {step: INPUT | THINK | ACTION | RESULT | END, tool_name: (name of the tool ), tool_args: (arguments for the tool in JSON format ), inlineData: (Image metadata object with mimetype and Image Buffer String), observation: (input query observation | next step to be taken based on previous steps and execution | result of the execution of the tool ) } 
    
    RULES: 
    
    1. You must return the response strictly in JSON Format. 
    
    2. You must THINK and perform the ACTION in step by step manner based on previous steps and actions always before taking the next step or providing the final observation. 
    
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
    
    assistant: {step: "END" } ` 

    const userQuery= `Navigate to: https://ui.shadcn.com/docs/forms/react-hook-form
    Identify the form elements on the page (Username and Description fields)
    Automatically fill in the Username and Description. ` 

    let messages= [{role: "system", content: system_prompt }, {role: "user", content: userQuery } ] 

    while(true ) 
    { 
      const response= await client.chat.send({ 
        chatRequest: 
        { 
          model: "openai/gpt-oss-120b:free", 
          messages: messages, 
          temperature: 0.05, 
          stream: false 
        } 
      } ) 
      let res= JSON.parse(response.choices[0].message.content ) 
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
          const result= await navigateToUrl(page, res.tool_args.utl ) 
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
                model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", 
                messages: [{ 
                  role: "assistant", 
                  content: [{ 
                    type: "text", 
                    text: "What are fields and labels visible on the viewport of this page? " 
                  }, { 
                    type: "image_url", 
                    imageUrl: {url: screenshotPayload } 
                  } ] 
                } ], 
                temperature: 0.05, 
                stream: false 
              } 
            } ) 
            resultMessage= JSON.stringify({step: "RESULT", observation: imageChat.choices[0].message.content } ) 
          } 
          else 
          { 
            resultMessage= JSON.stringify({step: "RESULT", observation: result.message } ) 
          } 
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
      setTimeout(()=> 
      {}, 5000 ) 
    } 
} ) 
