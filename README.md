## Soma Capital Technical Assessment

This is a technical assessment as part of the interview process for Soma Capital.

> [!IMPORTANT]  
> You will need a Pexels API key to complete the technical assessment portion of the application. You can sign up for a free API key at https://www.pexels.com/api/  

To begin, clone this repository to your local machine.

## Development

This is a [NextJS](https://nextjs.org) app, with a SQLite based backend, intended to be run with the LTS version of Node.

To run the development server:

```bash
npm i
npm run dev
```

## Task:

Modify the code to add support for due dates, image previews, and task dependencies.

### Part 1: Due Dates 

When a new task is created, users should be able to set a due date.

When showing the task list is shown, it must display the due date, and if the date is past the current time, the due date should be in red.

### Part 2: Image Generation 

When a todo is created, search for and display a relevant image to visualize the task to be done. 

To do this, make a request to the [Pexels API](https://www.pexels.com/api/) using the task description as a search query. Display the returned image to the user within the appropriate todo item. While the image is being loaded, indicate a loading state.

You will need to sign up for a free Pexels API key to make the fetch request. 

### Part 3: Task Dependencies

Implement a task dependency system that allows tasks to depend on other tasks. The system must:

1. Allow tasks to have multiple dependencies
2. Prevent circular dependencies
3. Show the critical path
4. Calculate the earliest possible start date for each task based on its dependencies
5. Visualize the dependency graph

## Submission:

1. Add a new "Solution" section to this README with a description and screenshot or recording of your solution. 
2. Push your changes to a public GitHub repository.
3. Submit a link to your repository in the application form.

Thanks for your time and effort. We'll be in touch soon!


## Solution

This solution implements all three parts of the Soma Capital Technical Assessment: **Due Dates**, **Image Generation**, and **Task Dependencies**.

### 1. Due Dates
- Added a date picker when creating a new task to set a **due date**.
- Due date is displayed alongside the task.
- If the due date has passed, it is shown **in red** to indicate it’s overdue.

### 2. Image Generation
- Integrated the **Pexels API** to fetch a relevant image based on the task description.
- Displays a loading spinner until the image is fetched.
- The image is displayed as a thumbnail within the task item.

### 3. Task Dependencies
- Added the ability for tasks to have **multiple dependencies**.
- Prevented **circular dependencies** using dependency checks before saving.
- Calculated the **earliest start date** for each task based on dependencies.
- Visualized the dependency graph using [d3-graphs] to show the **critical path** clearly.

### Recording

### Video
- A demo video showing Task List with Due Dates, Image Preview from Pexels API,  Task Dependency and Dependency Graph Visualization.
- Watch the demo video [here](https://drive.google.com/file/d/13g5x48FX5GVWRLkSP5sTmsTae4zGEmJU/view?usp=sharing).


### My Approach
- First understood the project structure and requirements.
- Broke down tasks into smaller steps (API updates, UI changes, DB changes).
- Worked locally, tested each change immediately.
- Followed a step-by-step debugging process whenever issues came up.
- Kept changes clean and meaningful before committing.

### Problems / Difficulties Faced
- Some files and folder structure were new to me.
- Faced type errors and missing dependencies.
- Database migration issues while adding new features.
- Needed to understand how existing API and frontend connect.

### How I Resolved Them
- Read through existing code to understand patterns.
- Installed and configured missing dependencies.
- Re-ran Prisma migrations after fixing schema changes.
- Used console logs and error outputs to track and fix issues quickly.
- Cross-checked with documentation and small test runs.

---

I have spent a good amount of time and effort on this task.  
I hope the result reflects the work and is worth the time I invested. 🙂



