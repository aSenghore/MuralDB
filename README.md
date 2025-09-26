<img width="1131" height="214" alt="image" src="https://github.com/user-attachments/assets/8dd1e624-8ce5-4402-ab76-f1561021fa2b" />


# Fall 2025
## :page_facing_up: Description
There are numerous resources for storing references and finding them, as well as various tools to keep track of work regarding art and writing, especially worldbuilding. MuralDB will allow you to store your references and images in individual, expandable and editable boards, while also allowing you to upload images and documents. Users should also be able to see the most recent uploads, allowing them to keep track of what they have been working on. The website should also have helpful resources to get people started. Some examples would be references to good drawing pads and screen tablets for digital artists, places to get consistent materials for physical artists, or places to find cameras for photographers. There is also a character prompt generator, with more tools in the works.

## :link: Repository URL
- [Link](https://github.com/aSenghore/MuralDB)

## :computer: Technologies
- JavaScript
- TypeScript
- [Node.js](https://nodejs.org/en/)
- React
- Figma

## :briefcase: Features (Fall 2025)
1. **Home Page**
    - Directs users to different parts of the site
    - Accessible login and sign-up functions
    - Recent uploads section to show the last added images and documents
2. **Gallery Pages**
    - Pages that store different galleries for users. Pages for references, created art/ photos, and uploaded documents.
3. **Tags**
    - Images and documents can be tagged for better organization site-wide/
4. **Database**
    - Stores images with login information, alongside documents, profile picture, and more.
5. **Tools**
    - A tools section dedicated to fun and helpful resources.
    - Currently only contains character prompt generator, upcoming tools include photo challenges, palette generator, and more.
6. **Resources**
    - Contains references to helpful resources for creatives.
    - Includes drawing tablets, sketchbooks, cameras, digital art software, and where to buy.
7. **UI/UX**
    - Smooth UI, closeable navigation.
    - Dark mode/ light mode toggle for users.
    - Seamless page switching.

## :floppy_disk: Installation Steps
1. Download and extract
2. Run ```npm install```
3. Go to ```firebase.ts``` in ```src/config/firebase.ts```
4. Replace the firebase configuration with your own firebase configuration (assuming the site is being installed for testing and development)
5. Follow the instructions in FIREBASE_SETUP.md for the firestore and storage rules.

## :runner: How To Run
1. From the src directory, run:
   ```
   npm start
   ```
   This will automatically start the app in a new tab.

2. Create and account or log in using an existing account.
    - At the current moment you have to sign up, then log in separately. This is currently being worked on.

## :space_invader: Team
**Abdou Senghore** <br>
UI/UX Design, Database design, documentation, and code.
Figma was used to work on the basic UI, alongside some aspects for the site.


## :film_projector: Project Flyer & Video
TBA

## :white_check_mark: License
This work is licensed under the [GNU General Public License](http://www.gnu.org/licenses/gpl.html). You can use it as long as aany changes/modifications you make are available for others to do so as well. Any alternative versions must be licensed under the GPL.
