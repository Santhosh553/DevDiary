#!/usr/bin/env node

import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import {diffLines} from 'diff';
import chalk from 'chalk';
import { Command } from 'commander';

const program = new Command();

class DevDiary{
    constructor(repoPath = '.'){
        this.repoPath = path.join(repoPath, '.devdiary');       //.devdiary folder
        this.objectsPath = path.join(this.repoPath, 'objects');  //.devdiary/objects folder
        this.headPath = path.join(this.repoPath, 'HEAD');        //.devdiary/HEAD folder
        this.indexPath = path.join(this.repoPath, 'index');      //.devdiary/index folder for staging area
        this.init();
    }

    async init(){
        await fs.mkdir(this.objectsPath, {recursive: true});
        try{
            await fs.writeFile(this.headPath, '', {flag: 'wx'}); //wx - write if not exist.
            await fs.writeFile(this.indexPath, JSON.stringify([]), {flag: 'wx'}); 
        }
        catch(err){
            console.log("Already initialized the .DevDiary folder.");
        }   
    }

    hashObject(content){
        return crypto.createHash('sha1').update(content, 'utf-8').digest('hex');
    }


    async add(fileToBeAdded){
        const fileData = await fs.readFile(fileToBeAdded, {encoding: 'utf-8'}); //read the file
        const fileHash = this.hashObject(fileData); //hash the file
        console.log(fileHash);
        const newFileHashedobjectsPath = path.join(this.objectsPath, fileHash); //.devdiary/objects/abc123
        await fs.writeFile(newFileHashedobjectsPath, fileData);
        await this.updateStagingArea(fileToBeAdded, fileHash);
        console.log("File added successfully. " + fileToBeAdded);
    }
 
    async updateStagingArea(filePath, fileHash){
        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'})); //read the index file
        index.push({path: filePath, hash: fileHash}); //add the file to the index 
        await fs.writeFile(this.indexPath, JSON.stringify(index)); //write the updated index file
    }

    async commit (message){
        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'})); //read the index file
        const parentCommit = await this.getCurrentHead(); //get the current head

        const commitData = {
            timeStamp: new Date().toISOString(),
            message,
            files: index,
            parent: parentCommit
        };

        const commitHash = this.hashObject(JSON.stringify(commitData)); //hash the commit data
        const commitPath = path.join(this.objectsPath, commitHash); //path to the commit file
        await fs.writeFile(commitPath, JSON.stringify(commitData)); //write the commit file
        await fs.writeFile(this.headPath, commitHash); //update the head to the new commit
        await fs.writeFile(this.indexPath, JSON.stringify([])); //clear the index file
        console.log("Commit created successfully. " + commitHash);

    }

    async getCurrentHead(){
        try{
        return await fs.readFile(this.headPath, {encoding: 'utf-8'});
        }
        catch(err){
            return null;
        }
    }

    async log(){
        let commitHash = await this.getCurrentHead();
        while(commitHash){
            const commitData = JSON.parse(await fs.readFile(path.join(this.objectsPath, commitHash), {encoding: 'utf-8'}));
            console.log(`commit ${commitHash}`);
            console.log(`Author Date: ${commitData.timeStamp}`);
            console.log(`\n\t${commitData.message}\n`);
            commitHash = commitData.parent;
        }
    
    }

    async showCommitDiff(commitHash){
        const commitData = JSON.parse(await this.getCommitData(commitHash));
        if(!commitData){
            console.log("Commit not found.");
            return;
        }
        console.log("Changes in commit: " + commitHash);
        for(const file of commitData.files){
            console.log(`\nChanges in file: ${file.path}`);
            const fileContent = await this.getFileContent(file.hash);
            console.log(fileContent);

            if(commitData.parent){
                const parentCommitData = JSON.parse(await this.getCommitData(commitData.parent));
                const parentFileContent = await this.getParentFileContent(parentCommitData, file.path);

                if(parentFileContent !== undefined){
                    console.log("\nDiff: ");
                    const diff = diffLines(parentFileContent, fileContent);

                    console.log(diff);
                    diff.forEach(part => {
                        if(part.added){
                            process.stdout.write(chalk.green("\n++"+ part.value));
                        }
                        else if(part.removed){
                            process.stdout.write(chalk.red("\n--"+ part.value));
                        }
                        else{
                            process.stdout.write(chalk.grey(part.value));
                        }
                    });

                    console.log("\n");
                }
                else{
                    console.log(" New File in parent commit.");
                }
            }
            else{
                console.log("First commit. No parent commit.");
            }
        }
    }


    async getParentFileContent(parentCommitData, filePath){
        const parentfile = parentCommitData.files.find(file => file.path === filePath);
        if(parentfile){
            return await this.getFileContent(parentfile.hash);
        }
    }


    async getCommitData(commitHash){
        const commitPath = path.join(this.objectsPath, commitHash);
        try{
            return await fs.readFile(commitPath, {encoding: 'utf-8'});
        }
        catch(err){
            console.log("Commit not found."+err);
            return null;
        }
    }

    async getFileContent(fileHash){
        const objectsPath = path.join(this.objectsPath, fileHash);
        return fs.readFile(objectsPath, {encoding: 'utf-8'});
    }

}


// (async () => {
//     const devdiary = new DevDiary();
//     await devdiary.add('sample.txt');
//     await devdiary.commit('second commit');
//     await devdiary.log();
//     await devdiary.showCommitDiff('394abcdce9f06af756f4a2af06148cd345518688');
// })();


program.command('init').action(async() => {
    const devdiary = new DevDiary();
});

program.command('add <file>').action(async(file) => {
    const devdiary = new DevDiary();
    await devdiary.add(file);
});

program.command('commit <message>').action(async(message) => {
    const devdiary = new DevDiary();
    await devdiary.commit(message);
});
program.command('log').action(async() => {
    const devdiary = new DevDiary();
    await devdiary.log();
});
program.command('show <commitHash>').action(async(commitHash) => { 
    const devdiary = new DevDiary();
    await devdiary.showCommitDiff(commitHash);
});

program.parse(process.argv);