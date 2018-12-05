import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../api.service';
import {flatMap, map, tap} from 'rxjs/operators';
import {WebsocketService} from "../../websocket.service";

@Component({
  selector: 'app-endpoint-details',
  templateUrl: './endpoint-details.component.html',
  styleUrls: ['./endpoint-details.component.css']
})
export class EndpointDetailsComponent implements OnInit {

  @Input() workspaceName: string;

  endpoint: Endpoint;
  calls: Call[];

  constructor(private route: ActivatedRoute,
              private api: ApiService,
              private wsService: WebsocketService,
              private router: Router) {
  }

  ngOnInit() {
    this.route.parent.params
      .pipe(
        map(params => params['workspaceName']),
        flatMap(workspaceName =>
          this.route.params.pipe(
            map(params => params['endpointId']),
            // fetch endpoint
            tap(endpointId => this.api.getEndpoint(workspaceName, endpointId).subscribe(endpoint => this.endpoint = endpoint)),
            // fetch calls
            tap(endpointId => this.api.getCalls(workspaceName, endpointId).subscribe(calls => this.calls = calls)),

            tap(_ => this.wsService.getUpdates$(workspaceName).subscribe(this.handleEvent))
          )
        ))
      .subscribe(
        // endpoint => this.endpoint = endpoint,
        // err => this.route.parent.url.subscribe(url => this.router.navigate([url]))
      );
  }

  private handleEvent(event: Event) { //fixme
    if (event.type == 'NewCall' && event.type) {
      const newCallEvent: NewCall = event as NewCall;
      if (newCallEvent.call.endpointId === this.endpoint.endpointId)
        this.calls.push(newCallEvent.call);
    }
  }

}
