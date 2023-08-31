import React, { useEffect, useState } from 'react';
import './App.css';
import { Papa } from 'papaparse';

function App() {
  const [loopStart, setLoopStart] = useState([]);
  const [file, setFile] = useState([]);
  const [fileData, setFileData] = useState([]);

  const handleFolderSelect = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const directoryInput = document.createElement("input");
    directoryInput.setAttribute("type", "file");
    directoryInput.setAttribute("webkitdirectory", true);
    directoryInput.setAttribute("directory", true);
    directoryInput.setAttribute("multiple", true);
    directoryInput.click();
    directoryInput.addEventListener("change", handleFileSelect, false);
  };

  const handleFileSelect = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.target.files;

    if (files.length === 0) {
      alert("No files found");
      return;
    }

    setFile([]);
    const jsonFiles = Array.from(files).filter(
      (file) => file.type === "application/json"
    );

    if (jsonFiles.length > 0) {
      const updatedFileData = [...fileData];
      for (let i = 0; i < jsonFiles.length; i++) {
        const jsonReader = new FileReader();
        jsonReader.onload = (e) => {
          const json = JSON.parse(e.target.result);
          // console.log("Parsed JSON:", json);
          updatedFileData.push(json); // Push the parsed JSON into the array
          // console.log("Updated File Data:", updatedFileData);
          setFileData(updatedFileData); // Update the state with the new array
          // console.log("Files:", updatedFileData.length);
        };
        jsonReader.readAsText(jsonFiles[i]);
      }
      // console.log("IF Exit", updatedFileData.length);
    }
  };

  // const obj5 = {
  //   Data: [...loopStart],
  // };

  // const handleJsonDownload = () => {
  //   const json = JSON.stringify(obj5);
  //   const blob = new Blob([json], { type: 'application/json' });
  //   const href = URL.createObjectURL(blob);
  //   const jsondownload = document.createElement("a");
  //   jsondownload.href = href;
  //   jsondownload.download = "para.json";
  //   document.body.appendChild(jsondownload);
  //   jsondownload.click();
  // };

  const convertToCSV = (data) => {
    const headers = ['FileName', 'Trackid', 'category', 'Hierarchy', 'xDiff', 'yDiff', 'is_small_objects'];
    const csvRows = [];

    // Create CSV header row
    csvRows.push(headers.join(','));

    // Create CSV data rows
    data.forEach((item) => {
      const values = headers.map((header) => item[header]);
      // const values = item[0];
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  };

  const csvDownload = () => {
    // const list = [...res].map((item) =>
    //   [item.image_url, item.tagged_class]
    // );
    // const jsonFile = list.map((subarray) => (
    //   {
    //     "image_url": subarray[0],
    //     "jeans_fit_type": subarray[1],
    //   })
    // );
    // console.log("length", loopStart.length);

    const csv = convertToCSV(loopStart);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const nested = () => {
    console.log("FileData", fileData);
    console.log("Started");
    const arr = [];
    for (let i = 0; i < fileData.length; i++) {

      // console.log(`FirstLoop${i}`);

      const file = fileData[i].Sequence[0].SequenceDetails.FileName;
      const start = fileData[i].Sequence[0].Labels[0].Devices[0].Channels[0].ObjectLabels[0].FrameObjectLabels;

      for (let j = 0; j < start.length; j++) {
        // console.log(`SecondLoop${j}`);
        const target = { FileName: null, Trackid: null, category: null, Hierarchy: null, xDiff: null, yDiff: null, is_small_objects: null };
        target.FileName = file;
        target.Trackid = start[j].Trackid;
        target.category = start[j].category;
        target.Hierarchy = start[j].attributes.Hierarchy[0];
        const xMin = Math.min(...start[j].shape.x);
        const xMax = Math.max(...start[j].shape.x);
        const yMin = Math.min(...start[j].shape.y);
        const yMax = Math.max(...start[j].shape.y);
        target.xDiff = xMax - xMin;
        target.yDiff = yMax - yMin;
        if (target.xDiff < 6 && target.yDiff < 6) {
          target.is_small_objects = 'Yes';
        } else if ((target.xDiff >= 6 && target.xDiff <= 8) && (target.yDiff >= 6 && target.yDiff <= 8)) {
          target.is_small_objects = 'Check';
        } else {
          target.is_small_objects = 'No';
        }
        arr.push(target);
      }
    }
    setLoopStart(arr);
    console.log("Finished");
  };

  // useEffect(() => {
  //   console.log("Files", fileData.length);
  // }, [fileData]);

  return (
    <div className="App">
      <div>
        <button onClick={handleFolderSelect}>Select Json Folder</button>
        <button onClick={nested}>Analyze Data</button>
        {/* <button onClick={handleJsonDownload}>Download JSON</button> */}
        <button onClick={() => csvDownload()}>Download CSV</button>
      </div>

    </div>
  );
}

export default App;