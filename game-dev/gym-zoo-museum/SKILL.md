---
name: gym-zoo-museum
description: Plan and review in-game documentation for video games with the Gym, Zoo, Museum, and Spatial Notes method. Use this skill when the developer talks about test maps, test levels, playgrounds, showcases, asset galleries, shooting ranges, old design documents or wikis, asset browsers with only thumbnails, in-editor notes, or smoke tests on levels. Use it also when the developer builds tools or workflows for artists, designers, or modders. The method works in any engine. Use it also when the developer does not say gym, zoo, or museum.
---

# Gym, Zoo, Museum

The method works in any engine.

## Core idea

Documentation outside the game becomes old, because the team is busy with the game. Put the documentation in the game, near the content. Then one action builds and documents the content.

Engineers read text, for example API documents. Artists, designers, and players seldom read text. Show them the answer in the game. Over time, the buildings replace the text documents. Keep text only for what a building cannot show.

## The buildings

Use only these names. Other names (test map, playground, showcase) mean the same thing.

| Building | Contains | Answers |
|---|---|---|
| Gym | Player movement, character controller, animation, abilities | How far can the player jump? How low can the player crouch? How much damage does the ability do? |
| Zoo | Assets, items, NPCs (non-player characters), VFX, audio, materials, animations | What is the true size? How does it look at night? What is its name? |
| Museum | Systems: shaders, physics, scripting, lighting | How does the system work? What must the developer not do? |
| Spatial notes | Notes placed in the world | Where is it? What is the problem? Who wrote the note? |

## Workflow

1. Find the questions that people ask again and again.
2. Select the building that answers each question. Start with the building that answers the most frequent question. A small team can use one room for all buildings.
3. Write a specification with the checklists below.
4. Find the parts that the system can generate or test automatically. Automate them.
5. Make the building the single source of truth. Text documents must link to it. They must not copy it.

Match the output to the request: a short answer for a quick question, a specification for a design request, a list of gaps for a review. For a request to build, use Build mode. Adapt the checklists to the project. Remove the items that do not apply.

## Gym checklist

- Add a test case for each main interaction between character and environment (jump, vault, climb, cover, crouch, slope). Example: for jump, build gaps of increasing width.
- Label the metrics, for example "1 m" and "2.5 m".
- Use color and text together: green = easy, orange = hard but possible, red = not possible.
- Add teleport points.
- Optional: let a bot run the gym each night. If the bot gets stuck, mark the build as failed and tell the team.

## Zoo checklist

- Show assets by folder, by use, and by level. Example: one zoo for all enemies, and one zoo for the assets of the forest level.
- Give each level more than one lighting setup (day, sunset, night).
- Add scale references (a grid or a standard character).
- Add vignettes (small scenes that you place by hand). Art directors use them to show how to combine assets. Example: a small camp that uses the tent, the fire, and the crates in the correct style.
- Show the name of an asset when the developer comes near. Let developers find assets by sight. Names help, but must not be the only way, because developers cannot guess names (iron gate, steel gate, metal-gate).
- Show data next to each asset when available: polygon count, LODs (levels of detail), material cost.
- Use the same method for VFX, audio, animations, and NPCs. Example: a VFX zoo plays all effects at the same time. The developer flies to an effect and reads its name.
- Generate the asset grid from an asset group. Do not place assets by hand.
- Each night, take a screenshot of the zoo and compare it with the previous screenshot. If the change is above a threshold that the team sets, send both images to the art director.
- Use debug views (for example shader cost) in the zoo to find bad assets fast.

## Museum checklist

- Give each system a live example that the developer can run. Example: for a cloth system, build one level with a flag, a cape, and a curtain.
- Add text that explains the system.
- Add links to the technical documents.
- Show what to do and what not to do. Give the reason. Example: "No overhangs. Overhangs confuse the player."
- For modders, make one entry level that links to all other levels.

## Spatial notes checklist

- Put each note where the item is: area labels, bugs, design changes, to-dos, "do not move".
- Make notes easy to create (mouse, keyboard, controller, voice).
- Save a screenshot, author, date, category, and status with each note.
- Link the notes to the ticket system.
- Make notes work in play builds, not only in the editor.
- Add a 2D map view for data such as polygon density.
- A visible note shows that the team already reported the problem. This prevents duplicate reports.

## Combine buildings

- Zoo + spatial notes: put review notes on assets.
- Gym + zoo: put items and enemies in one room. The developer takes an item and tests it at once. No console command is necessary.

## Mistakes to report

- A large design document that nobody updates.
- An asset browser with thumbnails only (no scale, no light).
- Metrics in a wiki that the level does not show.
- A zoo with assets placed by hand.
- Different names for the same building.
- Buildings without labels or teleport points.

## Build mode

Use this section when the developer asks you to build a Gym, Zoo, Museum, or add Spatial Notes.

1. Find the project facts yourself: engine, asset folders, and where the gameplay metrics are stored. Ask only for facts that you cannot find.
2. Ask the developer what to include. Use the checklist of the building. Show the items as a short list. Mark the items that you recommend. Ask in one message.
3. Wait for the answer. Do not build items that the developer did not select.
4. Read each metric from the game data. Do not type a value by hand.
5. Build one section at a time. Stop for review after each section.
6. If you cannot edit a file as text, write a generator or an editor script. Do not edit the file by hand.
7. Run the project when possible. Check the result. Report what you see.
8. If you cannot run or check the project, say so.
