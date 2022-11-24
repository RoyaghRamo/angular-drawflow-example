import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Drawflow from 'drawflow';
@Component({
  selector: 'app-drawing-board',
  templateUrl: './drawing-board.component.html',
  styleUrls: ['./drawing-board.component.scss'],
})
export class DrawingBoardComponent implements OnInit, AfterViewInit, OnChanges {
  @Input()
  nodes: any[];
  @Input()
  drawingData: string;
  @Input()
  locked: boolean;
  @Input()
  showLock: boolean;
  @Input()
  showNodes: boolean;
  @Input()
  otherDetails: any;

  editor!: any;
  editDivHtml: HTMLElement;
  editButtonShown: boolean = false;

  drawnNodes: any[] = [];
  selectedNodeId: string;
  selectedNode: any = {};

  lastMousePositionEv: any;

  nodeModal: ElementRef;
  @ViewChild('content') set setNodeModal(el: ElementRef) {
    this.nodeModal = el;
  }

  constructor(private modalService: NgbModal) {}

  // Private functions
  private initDrawFlow(): void {
    const drawFlowHtmlElement = <HTMLElement>document.getElementById('drawflow');

    const testEditor = new Drawflow(drawFlowHtmlElement);
    // testEditor.addConnection();

    this.editor = new Drawflow(drawFlowHtmlElement);

    this.editor.reroute = true;
    this.editor.curvature = 0.5;
    this.editor.reroute_fix_curvature = true;
    this.editor.reroute_curvature = 0.5;
    this.editor.force_first_input = false;
    this.editor.line_path = 1;
    this.editor.editor_mode = 'edit';

    this.editor.start();

    /*
    if (this.drawingData && Object.keys(JSON.parse(this.drawingData).drawflow.Home.data).length > 0) {
      console.log('this.drawingData :>> ', this.drawingData);
      this.editor.import(JSON.parse(this.drawingData));
    }
    */
  }

  private resetAllInputsOutputs() {
    this.nodes.forEach((node) => {
      node.inputs = 1;
      node.outputs = 1;
    });
  }

  private addEditorEvents() {
    // Events!
    this.editor.on('nodeCreated', (id: any) => {
      console.log('Editor Event :>> Node created ' + id, this.editor.getNodeFromId(id));
    });

    this.editor.on('nodeRemoved', (id: any) => {
      console.log('Editor Event :>> Node removed ' + id);
    });

    this.editor.on('nodeSelected', (id: any) => {
      console.log('Editor Event :>> Node selected ' + id, this.editor.getNodeFromId(id));
      this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${id}`];
      console.log('Editor Event :>> Node selected :>> this.selectedNode :>> ', this.selectedNode);
      console.log('Editor Event :>> Node selected :>> this.selectedNode :>> ', this.selectedNode.data);
    });

    this.editor.on('click', (e: any) => {
      console.log('Editor Event :>> Click :>> ', e);

      if (e.target.closest('.drawflow_content_node') != null || e.target.classList[0] === 'drawflow-node') {
        if (e.target.closest('.drawflow_content_node') != null) {
          this.selectedNodeId = e.target.closest('.drawflow_content_node').parentElement.id;
        } else {
          this.selectedNodeId = e.target.id;
        }
        this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`];
      }

      if (e.target.closest('#editNode') != null || e.target.classList[0] === 'edit-node-button') {
        // Open modal with Selected Node
        this.open(this.nodeModal, this.selectedNodeId);
      }

      if (e.target.closest('#editNode') === null) {
        this.hideEditButton();
      }
    });

    this.editor.on('moduleCreated', (name: any) => {
      console.log('Editor Event :>> Module Created ' + name);
    });

    this.editor.on('moduleChanged', (name: any) => {
      console.log('Editor Event :>> Module Changed ' + name);
    });

    this.editor.on('connectionCreated', (connection: any) => {
      console.log('Editor Event :>> Connection created ', connection);
    });

    this.editor.on('connectionRemoved', (connection: any) => {
      console.log('Editor Event :>> Connection removed ', connection);
    });

    this.editor.on('contextmenu', (e: any) => {
      console.log('Editor Event :>> Context Menu :>> ', e);

      if (e.target.closest('.drawflow_content_node') != null || e.target.classList[0] === 'drawflow-node') {
        if (e.target.closest('.drawflow_content_node') != null) {
          this.selectedNodeId = e.target.closest('.drawflow_content_node').parentElement.id;
        } else {
          this.selectedNodeId = e.target.id;
        }
        this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${this.selectedNodeId.slice(5)}`];

        this.showEditButton();
      }
    });

    this.editor.on('zoom', (zoom: any) => {
      console.log('Editor Event :>> Zoom level ' + zoom);
    });

    this.editor.on('addReroute', (id: any) => {
      console.log('Editor Event :>> Reroute added ' + id);
    });

    this.editor.on('removeReroute', (id: any) => {
      console.log('Editor Event :>> Reroute removed ' + id);
    });

    // this.editor.on('mouseMove', (position: any) => {
    //   console.log('Editor Event :>> Position mouse x:' + position.x + ' y:' + position.y);
    // });

    // this.editor.on('nodeMoved', (id: any) => {
    //   console.log('Editor Event :>> Node moved ' + id);
    // });

    // this.editor.on('translate', (position: any) => {
    //   console.log(
    //     'Editor Event :>> Translate x:' + position.x + ' y:' + position.y
    //   );
    // });
  }

  private initDrawingBoard() {
    this.initDrawFlow();
    if (!this.locked) {
      this.addEditorEvents();
    }
  }

  private showEditButton() {
    this.editButtonShown = true;
    this.editDivHtml = document.createElement('div');
    this.editDivHtml.id = 'editNode';
    this.editDivHtml.innerHTML = '<i class="fas fa-pen"></i>';
    this.editDivHtml.style.display = 'block';
    this.editDivHtml.style.position = 'absolute';
    this.editDivHtml.className = 'edit-node-button';

    const selectedNodeHtml = document.getElementById(this.selectedNodeId);
    selectedNodeHtml.append(this.editDivHtml);
  }

  private hideEditButton() {
    this.editButtonShown = false;
    this.editDivHtml = document.getElementById('editNode');
    if (this.editDivHtml) {
      this.editDivHtml.remove();
    }
  }

  open(content: any, nodeId: string) {
    this.hideEditButton();

    const oldNodeIdNumber = parseInt(nodeId.slice(5));
    this.selectedNode = this.editor.drawflow.drawflow.Home.data[`${oldNodeIdNumber}`];
    const oldNodeStringified = JSON.stringify(this.selectedNode);
    // const { inputsCount, outputsCount } = this.countInOutputsOfNode(JSON.parse(oldNodeStringified));

    const modalRef = this.modalService.open(content, { size: 'xl', backdrop: 'static', keyboard: false });

    modalRef.dismissed.subscribe((reason) => {
      if (typeof reason == 'object') {
        const newDrawnNode = reason;
        newDrawnNode.name = newDrawnNode.data.infos.name;
        newDrawnNode.html = `<div>${newDrawnNode.name}</div>`;

        if (oldNodeStringified != JSON.stringify(this.selectedNode)) {
          // Create Node
          newDrawnNode.id = this.editor.addNode(
            newDrawnNode.name,
            1,
            1,
            newDrawnNode.pos_x,
            newDrawnNode.pos_y,
            newDrawnNode.class,
            newDrawnNode.data,
            newDrawnNode.html,
            newDrawnNode.typenode
          );

          // Reestablish connections
          this.reestablishOldConnections(JSON.parse(oldNodeStringified), newDrawnNode.id);

          // Remove Old Node
          this.editor.removeNodeId(nodeId);
        }
      }
    });
  }

  onKeyEvent(e: any) {
    // this.nameAlreadyUsed = this.checkIfNameIsUsed(e.target.value, this.selectedNode.id);
  }

  private countInOutputsOfNode(node: any) {
    let inputsCount = 0;
    let outputsCount = 0;

    Object.keys(node.inputs).forEach((inputKey) => {
      if (node.inputs[`${inputKey}`].connections.length > 0) {
        inputsCount++;
      }
    });

    Object.keys(node.outputs).forEach((outputKey) => {
      if (node.outputs[`${outputKey}`].connections.length > 0) {
        outputsCount++;
      }
    });

    return { inputsCount, outputsCount };
  }

  private checkIfNameIsUsed(name: string, id: number) {
    for (let i = 0; i < Object.keys(this.editor.drawflow.drawflow.Home.data).length; i++) {
      const nodeId = Object.keys(this.editor.drawflow.drawflow.Home.data)[i];
      if (nodeId != `${id}`) {
        if (this.editor.drawflow.drawflow.Home.data[`${nodeId}`].name == name) {
          return true;
        }
      }
    }
    return false;
  }

  private reestablishOldConnections(oldNode: any, newNodeId: number) {
    Object.keys(oldNode.inputs).forEach((inputKey) => {
      oldNode.inputs[`${inputKey}`].connections.forEach((connection: any) => {
        this.editor.addConnection(connection.node, newNodeId, connection.input, inputKey);
      });
    });

    Object.keys(oldNode.outputs).forEach((outputKey) => {
      oldNode.outputs[`${outputKey}`].connections.forEach((connection: any) => {
        this.editor.addConnection(newNodeId, connection.node, outputKey, connection.output);
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes :>> ', changes);

    if (
      changes.drawingData &&
      changes.drawingData.currentValue &&
      changes.drawingData.currentValue.length > 0 &&
      Object.keys(JSON.parse(changes.drawingData.currentValue).drawflow.Home.data).length > 0
    ) {
      this.editor.import(JSON.parse(changes.drawingData.currentValue));
    }
  }

  ngOnInit(): void {
    // this.initDrawingBoard();
    // this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }

  ngAfterViewInit(): void {
    this.initDrawingBoard();
    this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }

  onDrawflowEvent(e: any) {
    switch (e.type) {
      case 'dragstart':
        // console.log('Drawflow Event: DragStart :>> e :>> ', e);
        this.selectedNode.data = JSON.parse(
          JSON.stringify([...this.nodes].find((node) => node.infos.name === e.target.outerText))
        );
        break;
      case 'dragenter':
        // console.log('Drawflow Event: DragEnter :>> e :>> ', e);
        break;
      case 'dragover':
        // console.log('Drawflow Event: DragOver :>> e :>> ', e);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'dragleave':
        // console.log('Drawflow Event: DragLeave :>> e :>> ', e);
        break;
      case 'drop':
        // console.log('Drawflow Event: Drop :>> e :>> ', e);
        e.preventDefault();
        this.addNodeToDrawBoard(e.clientX, e.clientY);
        this.resetAllInputsOutputs();
        break;

      default:
        console.log('Other Drawflow Event :>> e :>> ', e);
        break;
    }
  }

  // Drawflow Editor Operations
  addNodeToDrawBoard(pos_x: number, pos_y: number) {
    if (this.editor.editor_mode === 'edit') {
      pos_x =
        pos_x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) -
        this.editor.precanvas.getBoundingClientRect().x *
          (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom));

      pos_y =
        pos_y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) -
        this.editor.precanvas.getBoundingClientRect().y *
          (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom));

      console.log('addNodeToDrawBoard :>> this.selectedNode :>> ', this.selectedNode);

      const htmlTemplate = `<div>${this.selectedNode.data.infos.name}</div>`;

      this.editor.addNode(
        this.selectedNode.data.infos.name,
        1 /*this.selectedNode.data.inputs*/,
        1 /*this.selectedNode.data.outputs*/,
        pos_x,
        pos_y,
        '',
        this.selectedNode.data,
        htmlTemplate,
        false
      );
    }
  }

  onClear() {
    this.editor.clear();
  }

  changeMode() {
    this.locked = !this.locked;
    this.editor.editor_mode = this.locked != null && this.locked == false ? 'edit' : 'fixed';
  }

  onZoomOut() {
    this.editor.zoom_out();
  }

  onZoomIn() {
    this.editor.zoom_in();
  }

  onZoomReset() {
    this.editor.zoom_reset();
  }

  exportDrawingData() {
    return this.editor.export();
  }

  onSubmit() {
    this.drawingData = this.exportDrawingData();
  }
}
