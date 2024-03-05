import OpenAI from "openai";

const my_api_key = "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"; // replace with your api key here or put OPENAI_API_KEY in .env file and use process.env.OPENAI_API_KEY
// you need to add dangerouslyAllowBrowser flag to the OpenAI constructor to use the api directly in the browser
const client = new OpenAI({ apiKey: my_api_key, dangerouslyAllowBrowser: true });
/*
    * This function is used to generate a completion for the chat model.
    * Input parameters: user_message, the message from the user
    * Output: the response from the chat model
*/
export async function chatCompletion(user_message) {
  const completion = await client.chat.completions.create({
    messages: [
      // provide a role/task description for the model
      { "role": "system", "content": "You are a helpful assistant that can answer any question. Be versaitle, creative, and informative. For the fact-based questions, make sure to provide the source of the information." },
      // provide in-context examples for the model
      { "role": "user", "content": "Who won the world series in 2020?" },
      { "role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020." },
      { "role": "user", "content": "Write a news report about Notre Dame Football team's win over Stanford." },
      { "role": "assistant", "content": "The Notre Dame Football team secured a commanding victory over Stanford with a final score of 56-23. Head coach Marcus Freeman expressed his pride in the team's performance and the significance of reclaiming the Legends Trophy, highlighting the importance of the rivalry between the two institutions. The team demonstrated resilience, overcoming early challenges in the game and finishing the regular season on a strong note. Running back Audric Estimé had a standout performance, rushing for 238 yards and scoring four touchdowns, despite not being on the Doak Walker semifinalists list. His efforts contributed significantly to the team's success and set a new single-season touchdown record for Notre Dame. The Irish's offensive line also received praise for their performance, especially given the absence of two starting players. The replacements, Ashton Craig and Billy Schrauth, stepped up and continued to build on their previous week's performance. Notre Dame's victory over Stanford not only showcased the team's talent and determination but also set them up for a promising bowl season. The win brings their season record to 9-3, and they now await their bowl game assignment, which will be announced on December 4.​" },
      // provide the real user question/message to model
      { "role": "user", "content": user_message }],
    // provide the model name
    model: "gpt-4-1106-preview",
  })
  // get the real message from the top-1 completion
  return completion.choices[0].message.content;
}

// propose following actions based on the system response
export async function followUpGeneration(user_message, system_response) {
  const completion = await client.chat.completions.create({
    messages: [
      // provide a role/task description for the model
      { "role": "system", "content": "You are a helpful assistant that can propose follow-up actions for user based prior chat history. Be creative and comprehensive. Below is an example showing input/output JSON format:" },
      // provide in-context examples for the model
      {
        "role": "user", "content": `Generate 5 follow-up actions based on the following user instruction and system response: 
{
  "user_message": "Write a poem about boys and girls",
  "system_response": "Boys and girls, a tapestry unfurled,
  In hues of dreams and vibrant swirls.
  With laughter's echo, joy's bright light,
  They dance through days and into night.
  
  Boys, with courage bold and strong,
  A melody in their heart's song.
  Adventures call, they heed the plea,
  Exploring life with boundless glee."
}
      ` },
      {
        "role": "assistant", "content": ` The output of the follow-up action generation model is as follows:
{
  "follow_up_actions": [
    "Review and Edit", "Seek Feedback", "Incorporate Diverse Perspectives", "Explore Further Themes", "Refine the rthyms and rhymes"
}
      ` },
      // Provide output JSON format
      {
        "role": "assistant", "content": `Strictly follow the following output JSON format:
        {
          "follow_up_actions": [
            "Action 1", "Action 2", "Action 3", "Action 4", "Action 5"
          ]
        }
        `
      },
      // provide the real user question/message to model
      { "role": "user", "content": `Generate 5 follow-up actions based on the following user instruction and system response: ` + JSON.stringify({ user_message, system_response }) }],
    // provide the model name
    model: "gpt-4-1106-preview",
    // require model to return the response in JSON format
    response_format: { type: 'json_object' }
  })
  // Parse the string representation of JSON output to JSON object
  /* Output json format:
  {
    "follow_up_actions": [
      "Action 1", "Action 2", "Action 3", "Action 4", "Action 5"
    ]
  }
  */
  const followUpActions = JSON.parse(completion.choices[0].message.content);
  console.log("followUpActions: ", followUpActions);
  return followUpActions.follow_up_actions;
}

export async function generateBasedOnAction(system_response, action) {
  const completion = await client.chat.completions.create({
    messages: [
      // provide a role/task description for the model
      { "role": "system", "content": "You are a helpful assistant that can take the action on the prior response." },
      { "role": "user", "content": `The prior response is: ${system_response}. The required action is: ${action}. Please implement the action on the prior response.` }],
    // provide the model name
    model: "gpt-4-1106-preview",
  })
  // get the real message from the top-1 completion
  return completion.choices[0].message.content;
}