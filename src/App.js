import React, { useEffect, useState } from 'react'
import './App.css'
import { Papa } from 'papaparse'
import logo from "./aaailogo.png"
import { ToastContainer, toast, Zoom, Flip } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
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
  }

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
          updatedFileData.push(json);
          setFileData(updatedFileData);
        };
        jsonReader.readAsText(jsonFiles[i]);
      }
    }
    toast.info('Your data is loaded!', {
      position: "top-center",
      transition: Flip,
      autoClose: 1300,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }

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
  }

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


    const csv = convertToCSV(loopStart);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const nested = () => {
    const arr = [];
    for (let i = 0; i < fileData.length; i++) {
      const file = fileData[i].Sequence[0].SequenceDetails.FileName;
      const start = fileData[i].Sequence[0].Labels[0].Devices[0].Channels[0].ObjectLabels[0].FrameObjectLabels;
      for (let j = 0; j < start.length; j++) {
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
    toast.success('Your data is ready!', {
      position: "top-center",
      transition: Zoom,
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }

  return (
    <div className="bg-gradient-to-r from-slate-600 via-slate-800 to-slate-950 h-screen w-full ">
      <div className="h-1/7 flex  justify-between">
        <img className="h-20" src={logo} />
        {/* <p className="flex items-center text-white font-semibold text-xl justify-center mr-8">JSON QUALITY CHECK</p> */}
        <p class="flex items-center font-semibold text-2xl justify-center mr-8">
          <span class="bg-gradient-to-r text-transparent bg-clip-text from-cyan-100 to-blue-300">JSON QUALITY CHECK</span>
        </p>
      </div>
      <div className="bg-gradient-to-r from-slate-600 via-slate-800 to-slate-950 h-1/2  w-full flex justify-center items-center">

        <div className='text-center flex gap-10'>
          <button className="bg-gray-600 text-white rounded px-4 py-2 shadow-lg shadow-black font-medium" onClick={handleFolderSelect}>Select Json Folder</button>
          <button className="bg-orange-400 text-white rounded px-4 py-2 shadow-lg shadow-black font-medium" onClick={nested}>Analyze Data</button>
          <button className="bg-gray-600 text-white rounded px-4 py-2 shadow-lg shadow-black font-medium" onClick={() => csvDownload()}>Download CSV</button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}